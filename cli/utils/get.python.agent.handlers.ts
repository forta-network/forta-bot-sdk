import fs from 'fs'
import path, { join } from 'path'
import os from 'os'
import { PythonShell } from 'python-shell'
import ReadLines from 'n-readlines'
import { BlockEvent, Finding, HandleBlock, HandleTransaction, TransactionEvent } from "../../sdk"

// imports python agent handlers from file wrapped in javascript
export type GetPythonAgentHandlers = (pythonAgentPath: string) => Promise<{ handleTransaction?: HandleTransaction, handleBlock? : HandleBlock }>

const INITIALIZE_MARKER = "!*initialize*!"
const FINDING_MARKER = "!*forta_finding*!:"
const INITIALIZE_METHOD_NAME = "initialize"
const HANDLE_TRANSACTION_METHOD_NAME = 'handle_transaction'
const HANDLE_BLOCK_METHOD_NAME = 'handle_block'

export function provideGetPythonAgentHandlers(): GetPythonAgentHandlers {
  return async function getPythonAgentHandlers(pythonAgentPath: string) {
    // determine whether this agent has block/transaction handlers
    const { hasInitializeHandler, hasBlockHandler, hasTransactionHandler } = hasHandlers(pythonAgentPath)
    if (!hasBlockHandler && !hasTransactionHandler) throw new Error(`no handlers found in ${pythonAgentPath}`)

    const pythonHandler = getPythonHandler(pythonAgentPath)
    return {
      initialize: hasInitializeHandler ? pythonHandler : undefined,
      handleBlock: hasBlockHandler ? pythonHandler : undefined,
      handleTransaction: hasTransactionHandler ? pythonHandler : undefined
    }
  }
}

function hasHandlers(agentPath: string) {
  const lineReader = new ReadLines(agentPath)
  let hasTransactionHandler = false
  let hasBlockHandler = false
  let hasInitializeHandler = false
  let line
  while (line = lineReader.next()) {
    line = line.toString('ascii')
    if (line.startsWith(`def ${HANDLE_TRANSACTION_METHOD_NAME}`)) {
      hasTransactionHandler = true
    } else if (line.startsWith(`def ${HANDLE_BLOCK_METHOD_NAME}`)) {
      hasBlockHandler = true
    } else if (line.startsWith(`def ${INITIALIZE_METHOD_NAME}`)) {
      hasInitializeHandler = true
    }
  }
  return { hasTransactionHandler, hasBlockHandler, hasInitializeHandler }
}

function getPythonHandler(agentPath: string) {
  // determine what the python module to import will be
  const agentModule = agentPath.replace(`${process.cwd()}${path.sep}`, '').replace('.py', '').replace(path.sep, '.')
  
  // write a wrapper script to invoke the agent handlers
  // WARNING! BE CAREFUL OF INDENTATION HERE
  const pythonWrapperScript = `
import sys
sys.path.append('${process.cwd()}')
import json
from forta_agent import BlockEvent, TransactionEvent
import ${agentModule}

while True:
  try:
    msgJson = json.loads(input())
    msgType = msgJson['msgType']
    if msgType == '${INITIALIZE_METHOD_NAME}':
      ${agentModule}.${INITIALIZE_METHOD_NAME}()
      print(f'${INITIALIZE_MARKER}')
    elif msgType == '${HANDLE_TRANSACTION_METHOD_NAME}':
      hash = msgJson['hash']
      event = TransactionEvent(msgJson)
      findings = ${agentModule}.${HANDLE_TRANSACTION_METHOD_NAME}(event)
      print(f'${FINDING_MARKER}{hash}:{json.dumps(findings, default=lambda f: f.toJson())}')
    elif msgType == '${HANDLE_BLOCK_METHOD_NAME}':
      hash = msgJson['hash']
      event = BlockEvent(msgJson)
      findings = ${agentModule}.${HANDLE_BLOCK_METHOD_NAME}(event)
      print(f'${FINDING_MARKER}{hash}:{json.dumps(findings, default=lambda f: f.toJson())}')
  except Exception as e:
    print(e, file=sys.stderr)
`
  // write the wrapper script to file
  const randomInt = Math.floor(Math.random() * Date.now())
  const pythonWrapperPath = join(os.tmpdir(),`forta_agent_${randomInt}.py`)
  fs.writeFileSync(pythonWrapperPath, pythonWrapperScript)
  PythonShell.checkSyntaxFile(pythonWrapperPath)

  const promiseCallbackMap: {[hash: string]: { resolve: (val: any) => void, reject: (err: any) => void } } = {}
  const pythonWrapper = new PythonShell(pythonWrapperPath, { args: process.argv })
    // set event listener for outputs (printed string messages)
    .on("message", function (message: string) {
      // use findingMarker/initializeMarker to distinguish between returned findings and regular log output
      if (message.startsWith(INITIALIZE_MARKER)) {
        const { resolve } = promiseCallbackMap['init']
        resolve(undefined)
        delete promiseCallbackMap['init']
        return
      } else if (!message.startsWith(FINDING_MARKER)) {
        console.log(message)
        return
      }

      const hashStartIndex = FINDING_MARKER.length
      const hashEndIndex = message.indexOf(':', hashStartIndex)
      const hash = message.substr(hashStartIndex, hashEndIndex-hashStartIndex)
      const findingsJson = JSON.parse(message.substr(hashEndIndex+1)) as any[]
      const findings = findingsJson.map(findingJson => Finding.fromObject(JSON.parse(findingJson)))
      const { resolve } = promiseCallbackMap[hash]
      resolve(findings)
      delete promiseCallbackMap[hash]
    })
    .on("stderr", function (err) {
      console.log(err)
      const hash = Object.keys(promiseCallbackMap)[0]
      if (hash && promiseCallbackMap[hash]) {
        const { reject } = promiseCallbackMap[hash]
        reject(new Error(`python: ${err}`))
      }
    })

  return function handler(event: TransactionEvent | BlockEvent | undefined) {
    return new Promise((resolve, reject) => {
      let msgType, hash
      if (!event) {
        msgType = INITIALIZE_METHOD_NAME
        hash = 'init'
      } else if (event instanceof BlockEvent) {
        msgType = HANDLE_BLOCK_METHOD_NAME
        hash = event.blockHash
      } else {
        msgType = HANDLE_TRANSACTION_METHOD_NAME
        hash = event.hash
      }

      // store reference to promise callbacks (use hash as a key to invoke promise callback on completion)
      promiseCallbackMap[hash] = { resolve, reject }
      // send event as json string through stdin to python wrapper
      pythonWrapper.send(JSON.stringify({ msgType, hash, ...event }))
    })
  } as any
}