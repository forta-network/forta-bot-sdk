import { HandleBlock, HandleTransaction, HandleAlert, Initialize, InitializeResponse } from "../../sdk"
import { assertExists, assertIsNonEmptyString } from "."
import { GetPythonAgentHandlers } from './get.python.agent.handlers'

type AgentHandlers = { 
  initialize?: Initialize,
  initializeResponse?: InitializeResponse | void,
  handleTransaction?: HandleTransaction,
  handleBlock?: HandleBlock,
  handleAlert?: HandleAlert,
}

type GetAgentHandlersOptions = {
  shouldRunInitialize?: boolean
}

// imports agent handlers from project
export type GetAgentHandlers = (options?: GetAgentHandlersOptions) => Promise<AgentHandlers>

export function provideGetAgentHandlers(
  agentPath: string,
  getPythonAgentHandlers: GetPythonAgentHandlers,
  dynamicImport: (path: string) => Promise<any>
): GetAgentHandlers {
  assertIsNonEmptyString(agentPath, 'agentPath')
  assertExists(getPythonAgentHandlers, 'getPythonAgentHandlers')
  assertExists(dynamicImport, 'dynamicImport')

  let agentHandlers: AgentHandlers

  return async function getAgentHandlers(options: GetAgentHandlersOptions = { shouldRunInitialize: true }) {
    // only get the agent handlers once
    if (agentHandlers) {
      return agentHandlers
    }

    try {
      if (agentPath.endsWith(".py")) {
        agentHandlers = await getPythonAgentHandlers(agentPath)
      } else {
        agentHandlers = (await dynamicImport(agentPath)).default
      }
    } catch (e) {
      throw new Error(`issue getting agent handlers: ${e.message}`)
    }
    
    if (options.shouldRunInitialize && agentHandlers.initialize) {
      try {
        console.log('initializing agent...')
        agentHandlers.initializeResponse = await agentHandlers.initialize()
      } catch (e) {
        throw new Error(`error initializing agent: ${e.message}`)
      }
    }

    return agentHandlers
  }
}
