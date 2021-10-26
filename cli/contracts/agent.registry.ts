import { ethers, Contract, providers, Wallet } from "ethers"
import AgentRegistryAbi from "./agent.registry.abi.json"

const GAS_MULTIPLIER = 1.15

export default class AgentRegistry {
  private contract: Contract;

  constructor(
    ethersAgentRegistryProvider: providers.JsonRpcProvider,
    agentRegistryContractAddress: string
  ) {
    this.contract = new ethers.Contract(
      agentRegistryContractAddress,
      AgentRegistryAbi,
      ethersAgentRegistryProvider
    )
  }

  async agentExists(agentId: string) {
    const agent = await this.contract.getAgent(agentId)
    return !!agent.metadata
  }
  
  async createAgent(fromWallet: Wallet, agentId: string, reference: string) {
    const from = fromWallet.getAddress()
    const contractWithSigner = this.contract.connect(fromWallet)
    const gas = await contractWithSigner.estimateGas.createAgent(agentId, from, reference, [1])
    const tx = await contractWithSigner.createAgent(agentId, from, reference, [1], { gasLimit: gas.mul(GAS_MULTIPLIER) })
    await tx.wait()
    return tx.hash
  }

  async updateAgent(fromWallet: Wallet, agentId: string, reference: string) {
    const contractWithSigner = this.contract.connect(fromWallet)
    const gas = await contractWithSigner.estimateGas.updateAgent(agentId, reference, [1])
    const tx = await contractWithSigner.updateAgent(agentId, reference, [1], { gasLimit: gas.mul(GAS_MULTIPLIER) })
    await tx.wait()
    return tx.hash
  }

  async isEnabled(agentId: string) {
    return this.contract.isEnabled(agentId)
  }

  async disableAgent(fromWallet: Wallet, agentId: string) {
    const contractWithSigner = this.contract.connect(fromWallet)
    const gas = await contractWithSigner.estimateGas.disableAgent(agentId, 1)// Permission.OWNER = 1
    const tx = await contractWithSigner.disableAgent(agentId, 1, { gasLimit: gas.mul(GAS_MULTIPLIER) })
    await tx.wait()
    return tx.hash
  }

  async enableAgent(fromWallet: Wallet, agentId: string) {
    const contractWithSigner = this.contract.connect(fromWallet)
    const gas = await contractWithSigner.estimateGas.enableAgent(agentId, 1)// Permission.OWNER = 1
    const tx = await contractWithSigner.enableAgent(agentId, 1, { gasLimit: gas.mul(GAS_MULTIPLIER) })
    await tx.wait()
    return tx.hash
  }
}