import { HandleBlock, HandleTransaction, Initialize } from "../../sdk"
import { assertExists, assertIsNonEmptyString } from "."
import { GetPythonAgentHandlers } from './get.python.agent.handlers'

type AgentHandlers = { 
  initialize?: Initialize,
  handleTransaction?: HandleTransaction,
  handleBlock?: HandleBlock
}

// imports agent handlers from project
export type GetAgentHandlers = () => Promise<AgentHandlers>

export function provideGetAgentHandlers(
  agentPath: string,
  getPythonAgentHandlers: GetPythonAgentHandlers,
  dynamicImport: (path: string) => Promise<any>
): GetAgentHandlers {
  assertIsNonEmptyString(agentPath, 'agentPath')
  assertExists(getPythonAgentHandlers, 'getPythonAgentHandlers')
  assertExists(dynamicImport, 'dynamicImport')

  let agentHandlers: AgentHandlers

  return async function getAgentHandlers() {
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
    
    if (agentHandlers.initialize) {
      try {
        console.log('initializing agent...')
        await agentHandlers.initialize()
      } catch (e) {
        throw new Error(`error initializing agent: ${e.message}`)
      }
    }

    return agentHandlers
  }
}
