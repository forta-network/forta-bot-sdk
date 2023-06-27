import fs from 'fs'
import path, { join } from 'path'
import os from 'os'
import { PythonShell } from 'python-shell'
import ReadLines from 'n-readlines'
import {
  BlockEvent,
  Finding,
  HandleAlert,
  HandleBlock,
  HandleTransaction,
  AlertEvent,
  TransactionEvent
} from "../../sdk"
import { assertIsNonEmptyString } from '.'

// imports python agent handlers from file wrapped in javascript
export type GetPythonAgentHandlers = (pythonAgentPath: string) => Promise<{ handleTransaction?: HandleTransaction, handleBlock? : HandleBlock, handleAlert?: HandleAlert }>

const INITIALIZE_MARKER = "!*initialize*!"
const FINDING_MARKER = "!*forta_finding*!:"
const FINDING_END_MARKER = "-!*forta_finding*!-:"
const INITIALIZE_METHOD_NAME = "initialize"
const HANDLE_TRANSACTION_METHOD_NAME = 'handle_transaction'
const HANDLE_BLOCK_METHOD_NAME = 'handle_block'
const HANDLE_ALERT_METHOD_NAME = 'handle_alert'

export function provideGetPythonAgentHandlers(
  contextPath: string
): GetPythonAgentHandlers {
  assertIsNonEmptyString(contextPath, 'contextPath')

  return async function getPythonAgentHandlers(pythonAgentPath: string) {
    // determine whether this agent has block/transaction handlers
    const { hasInitializeHandler, hasBlockHandler, hasTransactionHandler, hasAlertHandler } = hasHandlers(pythonAgentPath)
    if (!hasBlockHandler && !hasTransactionHandler && !hasAlertHandler) throw new Error(`no handlers found in ${pythonAgentPath}`)

    const pythonHandler = getPythonHandler(pythonAgentPath, contextPath)
    return {
      initialize: hasInitializeHandler ? pythonHandler : undefined,
      handleBlock: hasBlockHandler ? pythonHandler : undefined,
      handleTransaction: hasTransactionHandler ? pythonHandler : undefined,
      handleAlert: hasAlertHandler ? pythonHandler : undefined
    }
  }
}

function hasHandlers(agentPath: string) {
  const lineReader = new ReadLines(agentPath)
  let hasTransactionHandler = false
  let hasBlockHandler = false
  let hasInitializeHandler = false
  let hasAlertHandler = false

  let line
  while (line = lineReader.next()) {
    line = line.toString('ascii')
    if (line.startsWith(`def ${HANDLE_TRANSACTION_METHOD_NAME}`)) {
      hasTransactionHandler = true
    } else if (line.startsWith(`def ${HANDLE_BLOCK_METHOD_NAME}`)) {
      hasBlockHandler = true
    } else if (line.startsWith(`def ${INITIALIZE_METHOD_NAME}`)) {
      hasInitializeHandler = true
    } else if (line.startsWith(`def ${HANDLE_ALERT_METHOD_NAME}`)) {
      hasAlertHandler = true
    }
  }
  return { hasTransactionHandler, hasBlockHandler, hasInitializeHandler, hasAlertHandler }
}

function getPythonHandler(agentPath: string, contextPath: string) {
  // determine what the python module to import will be
  const agentModule = agentPath.replace(`${contextPath}${path.sep}`, '').replace('.py', '').replace(path.sep, '.')
  
  // write a wrapper script to invoke the agent handlers
  // WARNING! BE CAREFUL OF INDENTATION HERE
  const pythonWrapperScript = `
import sys
sys.path.append('${contextPath}')
import json
from forta_agent import BlockEvent, TransactionEvent, AlertEvent
import ${agentModule}

while True:
  try:
    msgJson = json.loads(input())
    msgType = msgJson['msgType']
    if msgType == '${INITIALIZE_METHOD_NAME}':
      initializeResponse = ${agentModule}.${INITIALIZE_METHOD_NAME}()
      print(f'${INITIALIZE_MARKER}{json.dumps(initializeResponse) if initializeResponse is not None else ""}')
    elif msgType == '${HANDLE_TRANSACTION_METHOD_NAME}':
      hash = msgJson['hash']
      event = TransactionEvent(msgJson)
      findings = ${agentModule}.${HANDLE_TRANSACTION_METHOD_NAME}(event)
      print(f'${FINDING_MARKER}{hash}:{json.dumps(findings, default=lambda f: f.toJson())}${FINDING_END_MARKER}')
    elif msgType == '${HANDLE_BLOCK_METHOD_NAME}':
      hash = msgJson['hash']
      event = BlockEvent(msgJson)
      findings = ${agentModule}.${HANDLE_BLOCK_METHOD_NAME}(event)
      print(f'${FINDING_MARKER}{hash}:{json.dumps(findings, default=lambda f: f.toJson())}${FINDING_END_MARKER}')
    elif msgType == '${HANDLE_ALERT_METHOD_NAME}':
      hash = msgJson['hash']
      event = AlertEvent(msgJson)
      findings = ${agentModule}.${HANDLE_ALERT_METHOD_NAME}(event)
      print(f'${FINDING_MARKER}{hash}:{json.dumps(findings, default=lambda f: f.toJson())}${FINDING_END_MARKER}')
  except Exception as e:
    raise e
`
  // write the wrapper script to file
  const randomInt = Math.floor(Math.random() * Date.now())
  const pythonWrapperPath = join(os.tmpdir(),`forta_agent_${randomInt}.py`)
  fs.writeFileSync(pythonWrapperPath, pythonWrapperScript)
  PythonShell.checkSyntaxFile(pythonWrapperPath)

  const promiseCallbackMap: {[hash: string]: { resolve: (val: any) => void, reject: (err: any) => void } } = {}
  const createPythonShell = () => new PythonShell(pythonWrapperPath, { args: process.argv })
  // set event listener for outputs (printed string messages)
  .on("message", function (message: string) {
    // use findingMarker/initializeMarker to distinguish between returned findings and regular log output
    if (message.startsWith(INITIALIZE_MARKER)) {
      const initializeResponseStartIndex = INITIALIZE_MARKER.length
      const initializeResponseJson = message.substr(initializeResponseStartIndex)
      let initializeResponse = undefined
      if (initializeResponseJson.length) {
        initializeResponse = JSON.parse(initializeResponseJson)
      }
      const { resolve } = promiseCallbackMap['init']
      resolve(initializeResponse)
      delete promiseCallbackMap['init']
      return
    } else if (!message.startsWith(FINDING_MARKER)) {
      console.log(message)
      return
    }

    const hashStartIndex = FINDING_MARKER.length
    const hashEndIndex = message.indexOf(':', hashStartIndex)
    const hash = message.substr(hashStartIndex, hashEndIndex-hashStartIndex)
    const findingsEndMarkerIndex = message.indexOf(FINDING_END_MARKER, hashEndIndex+1)
    const findingsJsonString = message.substring(hashEndIndex+1, findingsEndMarkerIndex > 0 ? findingsEndMarkerIndex : undefined)
    const findingsJson = JSON.parse(findingsJsonString) as any[]
    const findings = findingsJson.map(findingJson => Finding.fromObject(JSON.parse(findingJson)))
    const { resolve } = promiseCallbackMap[hash]
    resolve(findings)
    delete promiseCallbackMap[hash]
  })
  .on("stderr", (err) => {
    console.log(err)
  })
  .on("pythonError",(err) => {
    const hash = Object.keys(promiseCallbackMap)[0]
    if (hash && promiseCallbackMap[hash]) {
      const { reject } = promiseCallbackMap[hash]
      reject(err)
      // we exit the nodejs process on python exceptions so that the scan node can properly
      // manage the lifecycle of the bot container i.e. re-initialize before feeding data again
      // (we exit the python child process on exceptions because thats the only way to print python error stack traces from the child process)
      process.exit(pythonShell.exitCode)
    }
  })
  let pythonShell = createPythonShell()

  return function handler(event: TransactionEvent | AlertEvent | BlockEvent | undefined) {
    return new Promise((resolve, reject) => {
      let msgType, hash
      if (!event) {
        msgType = INITIALIZE_METHOD_NAME
        hash = 'init'
      } else if (event instanceof BlockEvent) {
        msgType = HANDLE_BLOCK_METHOD_NAME
        hash = event.blockHash
      } else if (event instanceof AlertEvent) {
        msgType = HANDLE_ALERT_METHOD_NAME
        hash = event.alertHash
      } else {
        msgType = HANDLE_TRANSACTION_METHOD_NAME
        hash = event.hash
      }

      // if the python shell exited (due to a crash for example), create a new shell
      if (pythonShell.exitCode != undefined) {
        pythonShell = createPythonShell()
      }
      // store reference to promise callbacks (use hash as a key to invoke promise callback on completion)
      promiseCallbackMap[hash!] = { resolve, reject }
      // send event as json string through stdin to python shell
      pythonShell.send(JSON.stringify({ msgType, hash, ...event }))
    })
  } as any
}