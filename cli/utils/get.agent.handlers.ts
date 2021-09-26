import path from 'path'
import { HandleBlock, HandleTransaction } from "../../sdk"
import { assertExists } from "."
import { GetPythonAgentHandlers } from './get.python.agent.handlers'

// imports agent handlers from project
export type GetAgentHandlers = () => Promise<{ transactionHandlers: HandleTransaction[], blockHandlers: HandleBlock[] }>

export function provideGetAgentHandlers(
  handlerPaths: string[],
  getPythonAgentHandlers: GetPythonAgentHandlers
): GetAgentHandlers {
  assertExists(handlerPaths, 'handlerPaths')
  assertExists(getPythonAgentHandlers, 'getPythonAgentHandlers')

  let blockHandlers: HandleBlock[]
  let transactionHandlers: HandleTransaction[]

  return async function getAgentHandlers() {
    // only get the agent handlers once
    if (blockHandlers && transactionHandlers) {
      return { blockHandlers, transactionHandlers }
    }

    transactionHandlers = []
    blockHandlers = []
    try {
      for (let handlerPath of handlerPaths) {
        if (handlerPath.startsWith(`.${path.sep}`)) {
          handlerPath = handlerPath.replace(`.${path.sep}`, `${process.cwd()}${path.sep}`)
        }

        if (handlerPath.endsWith(".py")) {
          const { handleTransaction, handleBlock} = await getPythonAgentHandlers(handlerPath)
          if (handleTransaction) transactionHandlers.push(handleTransaction)
          if (handleBlock) blockHandlers.push(handleBlock)
        } else {
          const handlers = await import(handlerPath)
          const { handleTransaction, handleBlock } = handlers.default
          if (handleTransaction) transactionHandlers.push(handleTransaction)
          if (handleBlock) blockHandlers.push(handleBlock)
        }
      }
    } catch (e) {
      throw new Error(`issue getting agent handlers: ${e.message}`)
    }
    
    return { blockHandlers, transactionHandlers }
  }
}
