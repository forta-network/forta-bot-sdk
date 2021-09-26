import Web3 from "web3";
import { HandleBlock, HandleTransaction, Trace } from "../../sdk";
import { GetAgentHandlers } from "./get.agent.handlers";
import { GetTraceData } from "./get.trace.data";
import { assertExists, createBlockEvent, createTransactionEvent } from ".";

export type RunHandlersOnBlock = (blockHashOrNumber: string | number) => Promise<void>

export function provideRunHandlersOnBlock(
  web3: Web3,
  getAgentHandlers: GetAgentHandlers,
  getTraceData: GetTraceData
): RunHandlersOnBlock {
  assertExists(web3, 'web3')
  assertExists(getAgentHandlers, 'getAgentHandlers')
  assertExists(getTraceData, 'getTraceData')

  return async function runHandlersOnBlock(blockHashOrNumber: string | number) {
    const { blockHandlers, transactionHandlers } = await getAgentHandlers()
    if (!blockHandlers.length && !transactionHandlers.length) {
      throw new Error("no block/transaction handlers found")
    }

    console.log(`fetching block ${blockHashOrNumber}...`)
    const block = await web3.eth.getBlock(blockHashOrNumber, true)

    // run block handlers
    if (blockHandlers.length) {
      const networkId = await web3.eth.net.getId()
      const blockEvent = createBlockEvent(block, networkId)
      const findings = []
      for (const handleBlock of blockHandlers) {
        findings.push(...await handleBlock(blockEvent))
      }
      console.log(`${findings.length} findings for block ${block.hash} ${findings}`)
    }

    if (!transactionHandlers.length) return
    
    // run transaction handlers on all block transactions
    const traces = await getTraceData(block.number)
    const traceMap: { [txHash: string]: Trace[]} = {}
    traces.forEach(trace => {
      if (!trace.transactionHash) return
      const txHash = trace.transactionHash.toLowerCase()
      if (!traceMap[txHash]) traceMap[txHash] = []
      traceMap[txHash].push(trace)
    })

    const networkId = await web3.eth.net.getId()
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

      const findings = []
      for (const handleTransaction of transactionHandlers) {
        findings.push(...await handleTransaction(txEvent))
      }
      console.log(`${findings.length} findings for transaction ${transaction.hash} ${findings}`)
    }
  }
}



