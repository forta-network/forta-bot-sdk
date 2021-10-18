import Web3 from "web3"
import { Contract } from "web3-eth-contract"
import { AbiItem } from "web3-utils"
import AgentRegistryAbi from "./agent.registry.abi.json"

const GAS_MULTIPLIER = 1.15

export default class AgentRegistry {
  private contract: Contract;

  constructor(
    web3AgentRegistry: Web3,
    agentRegistryContractAddress: string
  ) {
    this.contract = new web3AgentRegistry.eth.Contract(
      <AbiItem[]>AgentRegistryAbi, 
      agentRegistryContractAddress
    )
  }

  async agentExists(agentId: string) {
    const agent = await this.contract.methods.getAgent(agentId).call()
    return !!agent
  }
  
  async createAgent(from: string, agentId: string, reference: string) {
    const createAgentTx = this.contract.methods.createAgent(agentId, from, reference, [1])
    const gas = await createAgentTx.estimateGas({ from })
    await createAgentTx.send({
      from,
      gas: Math.round(gas * GAS_MULTIPLIER)
    })
  }

  async updateAgent(from: string, agentId: string, reference: string) {
    const updateAgentTx = this.contract.methods.updateAgent(agentId, reference, [1])
    const gas = await updateAgentTx.estimateGas({ from })
    await updateAgentTx.send({
      from,
      gas: Math.round(gas * GAS_MULTIPLIER)
    })
  }

  async isEnabled(agentId: string) {
    return this.contract.methods.isEnabled(agentId).call()
  }

  async disableAgent(from: string, agentId: string) {
    const disableAgentTx = this.contract.methods.disableAgent(agentId, 1)// Permission.OWNER = 1
    const gas = await disableAgentTx.estimateGas({ from })
    await disableAgentTx.send({
      from,
      gas: Math.round(gas * GAS_MULTIPLIER)
    })
  }

  async enableAgent(from: string, agentId: string) {
    const enableAgentTx = this.contract.methods.enableAgent(agentId, 1)// Permission.OWNER = 1
    const gas = await enableAgentTx.estimateGas({ from })
    await enableAgentTx.send({
      from,
      gas: Math.round(gas * GAS_MULTIPLIER)
    })
  }
}