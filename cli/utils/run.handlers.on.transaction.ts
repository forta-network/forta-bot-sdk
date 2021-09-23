import Web3 from "web3";
import { assertExists, createTransactionEvent } from ".";
import { HandleTransaction } from "../../sdk";
import { GetAgentHandlers } from "./get.agent.handlers";
import { GetTraceData } from "./get.trace.data";

export type RunHandlersOnTransaction = (txHash: string) => Promise<void>

export function provideRunHandlersOnTransaction(
  web3: Web3,
  getAgentHandlers: GetAgentHandlers,
  getTraceData: GetTraceData
): RunHandlersOnTransaction {
  assertExists(web3, 'web3')
  assertExists(getAgentHandlers, 'getAgentHandlers')
  assertExists(getTraceData, 'getTraceData')

  let transactionHandlers: HandleTransaction[]
  
  return async function runHandlersOnTransaction(txHash: string) {
    // only get the agent handlers once
    if (!transactionHandlers) {
      const agentHandlers = await getAgentHandlers()
      transactionHandlers = agentHandlers.transactionHandlers
    }

    if (!transactionHandlers.length) {
      throw new Error("no transaction handlers found")
    }
      
    const networkId = await web3.eth.net.getId()
    const receipt = await web3.eth.getTransactionReceipt(txHash)
    const block = await web3.eth.getBlock(receipt.blockHash, true)
    const traces = await getTraceData(receipt.transactionHash)
    const txEvent = createTransactionEvent(receipt, block, networkId, traces)

    const findings = []
    for (const handleTransaction of transactionHandlers) {
      findings.push(...await handleTransaction(txEvent))
    }
    console.log(`${findings.length} findings for transaction ${txHash} ${findings}`)
  }
}