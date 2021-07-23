import Web3 from "web3"
import { Contract } from "web3-eth-contract"
import { AbiItem } from "web3-utils"
import AgentRegistryMetadata from "./AgentRegistry.json"

export default class AgentRegistry {
  private contract: Contract;

  constructor(
    web3AgentRegistry: Web3,
    agentRegistryContractAddress: string
  ) {
    this.contract = new web3AgentRegistry.eth.Contract(
      <AbiItem[]>AgentRegistryMetadata.abi, 
      agentRegistryContractAddress
    )
  }

  async agentExists(poolId: string, agentId: string) {
    return this.contract.methods.agentExists(poolId, agentId).call()
  }
  
  async addAgent(from: string, poolId: string, agentId: string, reference: string) {
    const addAgentTx = this.contract.methods.addAgent(poolId, agentId, reference)
    const gas = await addAgentTx.estimateGas({ from })
    await addAgentTx.send({
      from,
      gas: Math.round(gas * 1.15)
    })
  }

  async updateAgent(from: string, poolId: string, agentId: string, reference: string) {
    const updateAgentTx = this.contract.methods.updateAgent(poolId, agentId, reference)
    const gas = await updateAgentTx.estimateGas({ from })
    await updateAgentTx.send({
      from,
      gas: Math.round(gas * 1.15)
    })
  }
}