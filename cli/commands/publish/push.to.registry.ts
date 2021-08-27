import Web3 from "web3";
import { assertExists, assertIsNonEmptyString, keccak256 } from "../../utils";
import AgentRegistry from "./agent.registry";

// adds or updates agent to registry contract
export type PushToRegistry = (manifestReference: string, publicKey: string, privateKey: string) => Promise<void>

export default function providePushToRegistry(
  web3AgentRegistry: Web3,
  agentRegistry: AgentRegistry,
  agentId: string
): PushToRegistry {
  assertExists(web3AgentRegistry, 'web3AgentRegistry')
  assertExists(agentRegistry, 'agentRegistry')
  assertIsNonEmptyString(agentId, 'agentId')
  
  return async function pushToRegistry(manifestReference: string, publicKey: string, privateKey: string) {
    //make sure web3 knows about this wallet in order to sign the transaction
    web3AgentRegistry.eth.accounts.wallet.add(privateKey);

    const agentIdHash = keccak256(agentId)
    const agentExists = await agentRegistry.agentExists(agentIdHash)
    if (!agentExists) {
      console.log('adding agent to registry...')
      await agentRegistry.createAgent(publicKey, agentIdHash, manifestReference)
    } else {
      console.log('updating agent in registry...')
      await agentRegistry.updateAgent(publicKey, agentIdHash, manifestReference)
    }

    console.log(`${agentExists ? 'updated' : 'added'} agent ${agentIdHash} with reference ${manifestReference}`)
  }
}