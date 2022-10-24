import { Finding, Trace } from "../../sdk";
import { GetAgentHandlers } from "./get.agent.handlers";
import { GetTraceData } from "./get.trace.data";
import { assertExists, assertFindings, CreateBlockEvent, CreateTransactionEvent } from ".";
import { GetNetworkId } from "./get.network.id";
import { GetBlockWithTransactions } from "./get.block.with.transactions";
import { JsonRpcLog } from "./get.transaction.receipt";
import { GetLogsForBlock } from "./get.logs.for.block";

export type RunHandlersOnBlock = (blockHashOrNumber: string | number) => Promise<Finding[]>

export function provideRunHandlersOnBlock(
  getAgentHandlers: GetAgentHandlers,
  getNetworkId: GetNetworkId,
  getBlockWithTransactions: GetBlockWithTransactions,
  getTraceData: GetTraceData,
  getLogsForBlock: GetLogsForBlock,
  createBlockEvent: CreateBlockEvent,
  createTransactionEvent: CreateTransactionEvent
): RunHandlersOnBlock {
  assertExists(getAgentHandlers, 'getAgentHandlers')
  assertExists(getNetworkId, 'getNetworkId')
  assertExists(getBlockWithTransactions, 'getBlockWithTransactions')
  assertExists(getTraceData, 'getTraceData')
  assertExists(getLogsForBlock, 'getLogsForBlock')
  assertExists(createBlockEvent, 'createBlockEvent')
  assertExists(createTransactionEvent, 'createTransactionEvent')

  return async function runHandlersOnBlock(blockHashOrNumber: string | number) {
    const { handleBlock, handleTransaction } = await getAgentHandlers()
    if (!handleBlock && !handleTransaction) {
      throw new Error("no block/transaction handler found")
    }

    console.log(`fetching block ${blockHashOrNumber}...`)
    const [networkId, block] = await Promise.all([
      getNetworkId(),
      getBlockWithTransactions(blockHashOrNumber)
    ]) 

    let blockFindings: Finding[] = []
    let txFindings: Finding[] = []
    
    // run block handler
    if (handleBlock) {
      const blockEvent = createBlockEvent(block, networkId)
      blockFindings = await handleBlock(blockEvent)

      assertFindings(blockFindings)
      
      console.log(`${blockFindings.length} findings for block ${block.hash} ${blockFindings}`)
    }

    if (!handleTransaction) return blockFindings
    
    const blockNumber = parseInt(block.number)
    const [logs, traces] = await Promise.all([
      getLogsForBlock(blockNumber),
      getTraceData(blockNumber)
    ])

    // get logs for block and build map for each transaction
    const logMap: { [txHash: string]: JsonRpcLog[] } = {}
    logs.forEach(log => {
      if (!log.transactionHash) return
      const txHash = log.transactionHash.toLowerCase()
      if (!logMap[txHash]) logMap[txHash] = []
      logMap[txHash].push(log)
    })

    // get trace data for block and build map for each transaction
    const traceMap: { [txHash: string]: Trace[]} = {}
    traces.forEach(trace => {
      if (!trace.transactionHash) return
      const txHash = trace.transactionHash.toLowerCase()
      if (!traceMap[txHash]) traceMap[txHash] = []
      traceMap[txHash].push(trace)
    })

    // run transaction handler on all block transactions
    for (const transaction of block.transactions) {
      const txHash = transaction.hash.toLowerCase()
      const txEvent = createTransactionEvent(transaction, block, networkId, traceMap[txHash], logMap[txHash])
      const findings = await handleTransaction(txEvent)
      txFindings.push(...findings)

      assertFindings(findings)

      console.log(`${findings.length} findings for transaction ${transaction.hash} ${findings}`)
    }

    return blockFindings.concat(txFindings)
  }
}



