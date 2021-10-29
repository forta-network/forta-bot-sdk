import { Trace } from "../../sdk";
import { GetAgentHandlers } from "./get.agent.handlers";
import { GetTraceData } from "./get.trace.data";
import { assertExists, CreateBlockEvent, CreateTransactionEvent } from ".";
import { GetNetworkId } from "./get.network.id";
import { GetBlockWithTransactions } from "./get.block.with.transactions";
import { GetTransactionReceipt } from "./get.transaction.receipt";

export type RunHandlersOnBlock = (blockHashOrNumber: string | number) => Promise<void>

export function provideRunHandlersOnBlock(
  getAgentHandlers: GetAgentHandlers,
  getNetworkId: GetNetworkId,
  getBlockWithTransactions: GetBlockWithTransactions,
  getTransactionReceipt: GetTransactionReceipt,
  getTraceData: GetTraceData,
  createBlockEvent: CreateBlockEvent,
  createTransactionEvent: CreateTransactionEvent
): RunHandlersOnBlock {
  assertExists(getAgentHandlers, 'getAgentHandlers')
  assertExists(getNetworkId, 'getNetworkId')
  assertExists(getBlockWithTransactions, 'getBlockWithTransactions')
  assertExists(getTransactionReceipt, 'getTransactionReceipt')
  assertExists(getTraceData, 'getTraceData')
  assertExists(createBlockEvent, 'createBlockEvent')
  assertExists(createTransactionEvent, 'createTransactionEvent')

  return async function runHandlersOnBlock(blockHashOrNumber: string | number) {
    const { handleBlock, handleTransaction } = await getAgentHandlers()
    if (!handleBlock && !handleTransaction) {
      throw new Error("no block/transaction handler found")
    }

    console.log(`fetching block ${blockHashOrNumber}...`)
    const networkId = await getNetworkId()
    const block = await getBlockWithTransactions(blockHashOrNumber)

    // run block handler
    if (handleBlock) {
      const blockEvent = createBlockEvent(block, networkId)
      const findings = await handleBlock(blockEvent)
      console.log(`${findings.length} findings for block ${block.hash} ${findings}`)
    }

    if (!handleTransaction) return
    
    // get trace data for block and build map for each transaction
    const traces = await getTraceData(parseInt(block.number))
    const traceMap: { [txHash: string]: Trace[]} = {}
    traces.forEach(trace => {
      if (!trace.transactionHash) return
      const txHash = trace.transactionHash.toLowerCase()
      if (!traceMap[txHash]) traceMap[txHash] = []
      traceMap[txHash].push(trace)
    })

    // run transaction handler on all block transactions
    for (const transaction of block.transactions) {
      let receipt = await getTransactionReceipt(transaction.hash)
      if (!receipt) {
        console.log(`error fetching receipt for ${transaction.hash}`)
        continue;
      }
      const txEvent = createTransactionEvent(receipt, block, networkId, traceMap[transaction.hash.toLowerCase()])

      const findings = await handleTransaction(txEvent)
      console.log(`${findings.length} findings for transaction ${transaction.hash} ${findings}`)
    }
  }
}



