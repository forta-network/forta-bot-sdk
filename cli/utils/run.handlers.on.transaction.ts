import Web3 from "web3";
import { assertExists, CreateTransactionEvent } from ".";
import { GetAgentHandlers } from "./get.agent.handlers";
import { GetTraceData } from "./get.trace.data";

export type RunHandlersOnTransaction = (txHash: string) => Promise<void>

export function provideRunHandlersOnTransaction(
  web3: Web3,
  getAgentHandlers: GetAgentHandlers,
  getTraceData: GetTraceData,
  createTransactionEvent: CreateTransactionEvent
): RunHandlersOnTransaction {
  assertExists(web3, 'web3')
  assertExists(getAgentHandlers, 'getAgentHandlers')
  assertExists(getTraceData, 'getTraceData')
  assertExists(createTransactionEvent, 'createTransactionEvent')

  return async function runHandlersOnTransaction(txHash: string) {
    const { handleTransaction } = await getAgentHandlers()
    if (!handleTransaction) {
      throw new Error("no transaction handler found")
    }
      
    const networkId = await web3.eth.net.getId()
    const receipt = await web3.eth.getTransactionReceipt(txHash)
    const block = await web3.eth.getBlock(receipt.blockHash, true)
    const traces = await getTraceData(receipt.transactionHash)
    const txEvent = createTransactionEvent(receipt, block, networkId, traces)

    const findings = await handleTransaction(txEvent)
    console.log(`${findings.length} findings for transaction ${txHash} ${findings}`)
  }
}