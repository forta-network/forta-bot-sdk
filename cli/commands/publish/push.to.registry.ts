import { Wallet } from "ethers"
import { assertExists, assertIsNonEmptyString } from "../../utils"
import { AppendToFile } from '../../utils/append.to.file'
import AgentRegistry from "../../contracts/agent.registry"

// adds or updates agent to registry contract
export type PushToRegistry = (manifestReference: string, privateKey: string) => Promise<void>

export default function providePushToRegistry(
  appendToFile: AppendToFile,
  agentRegistry: AgentRegistry,
  agentId: string
): PushToRegistry {
  assertExists(appendToFile, 'appendToFile')
  assertExists(agentRegistry, 'agentRegistry')
  assertIsNonEmptyString(agentId, 'agentId')
  
  return async function pushToRegistry(manifestReference: string, privateKey: string) {
    const fromWallet = new Wallet(privateKey)
    const agentExists = await agentRegistry.agentExists(agentId)

    if (!agentExists) {
      console.log('adding agent to registry...')
      await agentRegistry.createAgent(fromWallet, agentId, manifestReference)
    } else {
      console.log('updating agent in registry...')
      await agentRegistry.updateAgent(fromWallet, agentId, manifestReference)
    }

    const logMessage = `successfully ${agentExists ? 'updated' : 'added'} agent id ${agentId} with manifest ${manifestReference}`
    console.log(logMessage)
    appendToFile(`${new Date().toUTCString()}: ${logMessage}`, 'publish.log')
  }
}