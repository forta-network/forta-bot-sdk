import { HandleBlock, HandleTransaction } from "../../sdk"
import { assertExists, assertIsNonEmptyString } from "."
import { GetPythonAgentHandlers } from './get.python.agent.handlers'

// imports agent handlers from project
export type GetAgentHandlers = () => Promise<{ transactionHandlers: HandleTransaction[], blockHandlers: HandleBlock[] }>

export function provideGetAgentHandlers(
  agentPath: string,
  getPythonAgentHandlers: GetPythonAgentHandlers,
  dynamicImport: (path: string) => Promise<any>
): GetAgentHandlers {
  assertIsNonEmptyString(agentPath, 'agentPath')
  assertExists(getPythonAgentHandlers, 'getPythonAgentHandlers')
  assertExists(dynamicImport, 'dynamicImport')

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
      if (agentPath.endsWith(".py")) {
        const { handleTransaction, handleBlock} = await getPythonAgentHandlers(agentPath)
        if (handleTransaction) transactionHandlers.push(handleTransaction)
        if (handleBlock) blockHandlers.push(handleBlock)
      } else {
        const handlers = await dynamicImport(agentPath)
        const { handleTransaction, handleBlock } = handlers.default
        if (handleTransaction) transactionHandlers.push(handleTransaction)
        if (handleBlock) blockHandlers.push(handleBlock)
      }
    } catch (e) {
      throw new Error(`issue getting agent handlers: ${e.message}`)
    }
    
    return { blockHandlers, transactionHandlers }
  }
}
