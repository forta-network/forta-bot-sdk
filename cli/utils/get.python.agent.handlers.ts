import fs from 'fs'
import path, { join } from 'path'
import os from 'os'
import { PythonShell } from 'python-shell'
import ReadLines from 'n-readlines'
import { BlockEvent, Finding, HandleBlock, HandleTransaction, TransactionEvent } from "../../sdk"
import { assertIsNonEmptyString } from "."

// imports python agent handlers from file wrapped in javascript
export type GetPythonAgentHandlers = (pythonAgentPath: string) => Promise<{ handleTransaction?: HandleTransaction, handleBlock? : HandleBlock }>

const HANDLE_TRANSACTION_METHOD_NAME = 'handle_transaction'
const HANDLE_BLOCK_METHOD_NAME = 'handle_block'

export function provideGetPythonAgentHandlers(pythonFindingMarker: string): GetPythonAgentHandlers {
  assertIsNonEmptyString(pythonFindingMarker, 'pythonFindingMarker')

  return async function getPythonAgentHandlers(pythonAgentPath: string) {
    // determine whether this agent has block/transaction handlers
    const { hasBlockHandler, hasTransactionHandler } = hasHandlers(pythonAgentPath)
    if (!hasBlockHandler && !hasTransactionHandler) throw new Error(`no handlers found in ${pythonAgentPath}`)

    let handleTransaction, handleBlock
    if (hasTransactionHandler) {
      handleTransaction = wrapPythonHandler(pythonAgentPath, pythonFindingMarker, HANDLE_TRANSACTION_METHOD_NAME)
    }
    if (hasBlockHandler) {
      handleBlock = wrapPythonHandler(pythonAgentPath, pythonFindingMarker, HANDLE_BLOCK_METHOD_NAME)
    }

    return {
      handleBlock,
      handleTransaction
    }
  }
}

function hasHandlers(agentPath: string) {
  const lineReader = new ReadLines(agentPath)
  let hasTransactionHandler = false
  let hasBlockHandler = false
  let line
  while (line = lineReader.next().toString('ascii')) {
      if (line.startsWith(`def ${HANDLE_TRANSACTION_METHOD_NAME}`)) {
        hasTransactionHandler = true
      } else if (line.startsWith(`def ${HANDLE_BLOCK_METHOD_NAME}`)) {
        hasBlockHandler = true
      }
  }
  return { hasTransactionHandler, hasBlockHandler }
}

function wrapPythonHandler(agentPath: string, findingMarker: string, methodName: string) {
  // determine what the python module to import will be
  const agentModule = agentPath.replace(`${process.cwd()}${path.sep}`, '').replace('.py', '').replace(path.sep, '.')
  // write a wrapper script to invoke the agent handler
  // WARNING! BE CAREFUL OF INDENTATION HERE
  const pythonWrapperScript = `
import sys
sys.path.append('${process.cwd()}')
import json
import ${agentModule}

event = json.loads(input())
findings = ${agentModule}.${methodName}(event)
print('${findingMarker}'+json.dumps(findings))
`
  // write the wrapper script to file
  const randomInt = Math.floor(Math.random() * Date.now())
  const pythonWrapperPath = join(os.tmpdir(),`forta_agent_${randomInt}.py`)
  fs.writeFileSync(pythonWrapperPath, pythonWrapperScript)
  PythonShell.checkSyntaxFile(pythonWrapperPath)

  return function handler(event: TransactionEvent | BlockEvent) {
    return new Promise((resolve, reject) => {
      const pythonWrapper = new PythonShell(pythonWrapperPath)
      // send event as json string through stdin to python wrapper
      pythonWrapper.send(JSON.stringify(event))
      // listen for outputs (printed string messages)
      pythonWrapper.on("message", function (message) {
        // use findingMarker to distinguish between returned findings and regular log output
        if (message.startsWith(findingMarker)) {
          const findingsJson = JSON.parse(message.substr(findingMarker.length)) as any[]
          const findings = findingsJson.map(findingJson => Finding.fromObject(findingJson))
          resolve(findings)
        } else {
          console.log(message)
        }
      })
      pythonWrapper.on("stderr", function (err) {
        console.log(err)
        if (err) reject(err)
      })
    })
  } as any
}