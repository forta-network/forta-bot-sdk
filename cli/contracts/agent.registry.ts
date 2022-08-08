import { BigNumber, ethers, providers, Wallet } from "ethers"
import { EventFragment, Interface } from "ethers/lib/utils"
import AgentRegistryAbi from "./agent.registry.abi.json"

const GAS_MULTIPLIER = 1.15
const GAS_PRICE_MULTIPLIER = 1.5
const FALLBACK_CREATE_AGENT_GAS_LIMIT = BigNumber.from(350_000)
const FALLBACK_UPDATE_AGENT_GAS_LIMIT = BigNumber.from(95_000)
const FALLBACK_ENABLE_AGENT_GAS_LIMIT = BigNumber.from(55_000)
const FALLBACK_DISABLE_AGENT_GAS_LIMIT = BigNumber.from(70_000)

 export type AgentDescription = {
  created: boolean;
  owner: string;
  metadata: string;
}

export const AGENT_REGISTRY_ABI = new Interface(AgentRegistryAbi);
export const AGENT_REGISTRY_EVENT_FRAGMENTS = AGENT_REGISTRY_ABI.fragments.filter(fragment => fragment.type === "event") as EventFragment[];

const RELEVANT_SMART_CONTRACT_EVENTS = ["AgentEnabled", "AgentUpdated", "Transfer"] as const;
export type StateChangeContractEvent = (typeof RELEVANT_SMART_CONTRACT_EVENTS)[number];
export const isRelevantSmartContractEvent = (str: any): str is StateChangeContractEvent => RELEVANT_SMART_CONTRACT_EVENTS.includes(str);


export const getTopicHashFromEventName = (eventName: StateChangeContractEvent): string | undefined => {
  const fragment = AGENT_REGISTRY_EVENT_FRAGMENTS.find(fragment => fragment.name === eventName);

  if(fragment){
      return AGENT_REGISTRY_ABI.getEventTopic(fragment);
  }
  return;
}

export const getEventNameFromTopicHash = (topicHash: string): string => {
  const eventFragment = AGENT_REGISTRY_ABI.getEvent(topicHash);
  let name = eventFragment.name;
  return name;
}

export default class BotRegistry {

  constructor(
    private ethersAgentRegistryProvider: providers.JsonRpcProvider,
    private botRegistryContractAddress: string
  ) {}

  async getAgent(botId: string): Promise<AgentDescription> {
    return this.getContract().getAgent(botId)
  }

  async agentExists(botId: string) {
    const agent = await this.getAgent(botId)
    return agent.created
  }
  
  async createAgent(fromWallet: Wallet, botId: string, reference: string, chainIds: number[]) {
    const from = fromWallet.address
    const contract = this.getContract(fromWallet)
    let gas = FALLBACK_CREATE_AGENT_GAS_LIMIT;
    try { gas = await contract.estimateGas.createAgent(botId, from, reference, chainIds)}
    catch (e) { console.log(`unable to estimate gas for createAgent, using fallback gas limit (${gas})`) }
    const txOptions = await this.getTxOptions(gas, fromWallet)
    const tx = await contract.createAgent(botId, from, reference, chainIds, txOptions)
    await tx.wait()
    return tx.hash
  }

  async updateAgent(fromWallet: Wallet, botId: string, reference: string, chainIds: number[]) {
    const contract = this.getContract(fromWallet)
    let gas = FALLBACK_UPDATE_AGENT_GAS_LIMIT
    try { gas = await contract.estimateGas.updateAgent(botId, reference, chainIds) }
    catch(e) { console.log(`unable to estimate gas for updateAgent, using fallback gas limit (${gas})`) }
    const txOptions = await this.getTxOptions(gas, fromWallet)
    const tx = await contract.updateAgent(botId, reference, chainIds, txOptions)
    await tx.wait()
    return tx.hash
  }

  async isEnabled(botId: string) {
    return this.getContract().isEnabled(botId)
  }

  async disableAgent(fromWallet: Wallet, botId: string) {
    const contract = this.getContract(fromWallet)
    let gas = FALLBACK_DISABLE_AGENT_GAS_LIMIT
    try { gas = await contract.estimateGas.disableAgent(botId, 1)/* Permission.OWNER = 1 */ }
    catch(e) { console.log(`unable to estimate gas for disableAgent, using fallback gas limit (${gas})`) }
    const txOptions = await this.getTxOptions(gas, fromWallet)
    const tx = await contract.disableAgent(botId, 1, txOptions)
    await tx.wait()
    return tx.hash
  }

  async enableAgent(fromWallet: Wallet, botId: string) {
    const contract = this.getContract(fromWallet)
    let gas = FALLBACK_ENABLE_AGENT_GAS_LIMIT
    try { gas = await contract.estimateGas.enableAgent(botId, 1)/* Permission.OWNER = 1 */ }
    catch(e) { console.log(`unable to estimate gas for enableAgent, using fallback gas limit (${gas})`) }
    const txOptions = await this.getTxOptions(gas, fromWallet)
    const tx = await contract.enableAgent(botId, 1, txOptions)
    await tx.wait()
    return tx.hash
  }

  private getContract(fromWallet?: Wallet) {
    return new ethers.Contract(
      this.botRegistryContractAddress,
      AgentRegistryAbi,
      fromWallet ? fromWallet.connect(this.ethersAgentRegistryProvider) : this.ethersAgentRegistryProvider
    )
  }

  private async getTxOptions(gasLimit: ethers.BigNumber, fromWallet: Wallet) {
    const gasPrice = await fromWallet.connect(this.ethersAgentRegistryProvider).getGasPrice()
    return {
      gasLimit: Math.round(gasLimit.toNumber() * GAS_MULTIPLIER),
      gasPrice: Math.round(gasPrice.toNumber() * GAS_PRICE_MULTIPLIER)
    }
  }
}