import { Wallet } from "ethers"
import { assertExists, assertIsNonEmptyString } from "../../utils"
import { AppendToFile } from '../../utils/append.to.file'
import AgentRegistry from "../../contracts/agent.registry"

// adds or updates agent to registry contract
export type PushToRegistry = (manifestReference: string, fromWallet: Wallet) => Promise<void>

export default function providePushToRegistry(
  appendToFile: AppendToFile,
  agentRegistry: AgentRegistry,
  agentId: string,
  chainIds: number[]
): PushToRegistry {
  assertExists(appendToFile, 'appendToFile')
  assertExists(agentRegistry, 'agentRegistry')
  assertIsNonEmptyString(agentId, 'agentId')
  assertExists(chainIds, 'chainIds')
  
  return async function pushToRegistry(manifestReference: string, fromWallet: Wallet) {
    const [agent, fromWalletBalance] = await Promise.all([
      agentRegistry.getAgent(agentId),
      fromWallet.getBalance()
    ])
    const agentExists = agent.created
    // verify wallet has some balance to pay transaction fee
    if (fromWalletBalance.eq(0)) {
      throw new Error(`insufficient balance to deploy agent for ${fromWallet.address}`)
    }

    if (!agentExists) {
      console.log('adding agent to registry...')
      await agentRegistry.createAgent(fromWallet, agentId, manifestReference, chainIds)
    } else {
      // verify that the agent is being updated from the same address that created it
      if (fromWallet.address.toLowerCase() !== agent.owner.toLowerCase()) {
        throw new Error(`agent can only be updated by owner (${agent.owner})`)
      }

      console.log('updating agent in registry...')
      await agentRegistry.updateAgent(fromWallet, agentId, manifestReference, chainIds)
    }

    const logMessage = `successfully ${agentExists ? 'updated' : 'added'} agent id ${agentId} with manifest ${manifestReference}`
    console.log(logMessage)
    appendToFile(`${new Date().toUTCString()}: ${logMessage}`, 'publish.log')
  }
}