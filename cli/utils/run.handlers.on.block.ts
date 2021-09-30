import Web3 from "web3";
import { Trace } from "../../sdk";
import { GetAgentHandlers } from "./get.agent.handlers";
import { GetTraceData } from "./get.trace.data";
import { assertExists, CreateBlockEvent, CreateTransactionEvent } from ".";

export type RunHandlersOnBlock = (blockHashOrNumber: string | number) => Promise<void>

export function provideRunHandlersOnBlock(
  web3: Web3,
  getAgentHandlers: GetAgentHandlers,
  getTraceData: GetTraceData,
  createBlockEvent: CreateBlockEvent,
  createTransactionEvent: CreateTransactionEvent
): RunHandlersOnBlock {
  assertExists(web3, 'web3')
  assertExists(getAgentHandlers, 'getAgentHandlers')
  assertExists(getTraceData, 'getTraceData')
  assertExists(createBlockEvent, 'createBlockEvent')
  assertExists(createTransactionEvent, 'createTransactionEvent')

  return async function runHandlersOnBlock(blockHashOrNumber: string | number) {
    const { handleBlock, handleTransaction } = await getAgentHandlers()
    if (!handleBlock && !handleTransaction) {
      throw new Error("no block/transaction handler found")
    }

    console.log(`fetching block ${blockHashOrNumber}...`)
    const networkId = await web3.eth.net.getId()
    const block = await web3.eth.getBlock(blockHashOrNumber, true)

    // run block handler
    if (handleBlock) {
      const blockEvent = createBlockEvent(block, networkId)
      const findings = await handleBlock(blockEvent)
      console.log(`${findings.length} findings for block ${block.hash} ${findings}`)
    }

    if (!handleTransaction) return
    
    // get trace data for block and build map for each transaction
    const traces = await getTraceData(block.number)
    const traceMap: { [txHash: string]: Trace[]} = {}
    traces.forEach(trace => {
      if (!trace.transactionHash) return
      const txHash = trace.transactionHash.toLowerCase()
      if (!traceMap[txHash]) traceMap[txHash] = []
      traceMap[txHash].push(trace)
    })

    // run transaction handler on all block transactions
    for (const transaction of block.transactions) {
      let receipt = await web3.eth.getTransactionReceipt(transaction.hash)
      // retry once if receipt fetching failed TODO figure out why this happens sometimes
      if (!receipt) {
        receipt = await web3.eth.getTransactionReceipt(transaction.hash)
      }
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



