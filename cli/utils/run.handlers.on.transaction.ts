import { assertExists, CreateTransactionEvent } from ".";
import { GetAgentHandlers } from "./get.agent.handlers";
import { GetBlockWithTransactions } from "./get.block.with.transactions";
import { GetNetworkId } from "./get.network.id";
import { GetTraceData } from "./get.trace.data";
import { GetTransactionReceipt } from "./get.transaction.receipt";

export type RunHandlersOnTransaction = (txHash: string) => Promise<void>

export function provideRunHandlersOnTransaction(
  getAgentHandlers: GetAgentHandlers,
  getNetworkId: GetNetworkId,
  getTransactionReceipt: GetTransactionReceipt,
  getBlockWithTransactions: GetBlockWithTransactions,
  getTraceData: GetTraceData,
  createTransactionEvent: CreateTransactionEvent
): RunHandlersOnTransaction {
  assertExists(getAgentHandlers, 'getAgentHandlers')
  assertExists(getNetworkId, 'getNetworkId')
  assertExists(getTransactionReceipt, 'getTransactionReceipt')
  assertExists(getBlockWithTransactions, 'getBlockWithTransactions')
  assertExists(getTraceData, 'getTraceData')
  assertExists(createTransactionEvent, 'createTransactionEvent')

  return async function runHandlersOnTransaction(txHash: string) {
    const { handleTransaction } = await getAgentHandlers()
    if (!handleTransaction) {
      throw new Error("no transaction handler found")
    }
      
    const networkId = await getNetworkId()
    const receipt = await getTransactionReceipt(txHash)
    const block = await getBlockWithTransactions(parseInt(receipt.blockNumber))
    const traces = await getTraceData(receipt.transactionHash)
    const txEvent = createTransactionEvent(receipt, block, networkId, traces)

    const findings = await handleTransaction(txEvent)
    console.log(`${findings.length} findings for transaction ${txHash} ${findings}`)
  }
}