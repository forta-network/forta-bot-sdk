import { assertExists, assertFindings, CreateTransactionEvent } from ".";
import { Finding } from "../../sdk";
import { GetAgentHandlers } from "./get.agent.handlers";
import { GetBlockWithTransactions } from "./get.block.with.transactions";
import { GetNetworkId } from "./get.network.id";
import { GetTraceData } from "./get.trace.data";
import { GetTransactionReceipt } from "./get.transaction.receipt";

export type RunHandlersOnTransaction = (txHash: string) => Promise<Finding[]>

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
      
    const [ networkId, receipt, traces ] = await Promise.all([
      getNetworkId(),
      getTransactionReceipt(txHash),
      getTraceData(txHash)
    ])
    const block = await getBlockWithTransactions(parseInt(receipt.blockNumber))

    txHash = txHash.toLowerCase()
    const transaction = block.transactions.find(tx => tx.hash.toLowerCase() === txHash)!
    const txEvent = createTransactionEvent(transaction, block, networkId, traces, receipt.logs)
    const findings = await handleTransaction(txEvent)
    
    assertFindings(findings)

    console.log(`${findings.length} findings for transaction ${txHash} ${findings}`)

    return findings
  }
}