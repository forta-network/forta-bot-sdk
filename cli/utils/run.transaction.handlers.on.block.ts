import Web3 from "web3";
import { BlockTransactionString } from "web3-eth"
import { assertExists, createTransactionEvent } from ".";
import { HandleTransaction } from "../../sdk";
import { Trace } from "../../sdk/trace";
import { GetTraceData } from "./get.trace.data";

export type RunTransactionHandlersOnBlock = (transactionHandlers: HandleTransaction[], block: BlockTransactionString) => Promise<void>

export function provideRunTransactionHandlersOnBlock(
  web3: Web3,
  getTraceData: GetTraceData
): RunTransactionHandlersOnBlock {
  assertExists(web3, 'web3')
  assertExists(getTraceData, 'getTraceData')

  return async function runTransactionHandlersOnBlock(transactionHandlers: HandleTransaction[], block: BlockTransactionString) {
    if (!transactionHandlers?.length) return;
      
    const traces = await getTraceData(block.number)
    const traceMap: { [txHash: string]: Trace[]} = {}
    traces.forEach(trace => {
      if (!trace.transactionHash) return
      const txHash = trace.transactionHash.toLowerCase()
      if (!traceMap[txHash]) traceMap[txHash] = []
      traceMap[txHash].push(trace)
    })

    const networkId = await web3.eth.net.getId()
    for (const txHash of block.transactions) {
      let [transaction, receipt] = await Promise.all([
        web3.eth.getTransaction(txHash), 
        web3.eth.getTransactionReceipt(txHash)
      ])
      // retry once if transaction fetching failed TODO figure out why this happens sometimes
      if (!transaction) {
        transaction = await web3.eth.getTransaction(txHash)
      }
      // retry once if receipt fetching failed TODO figure out why this happens sometimes
      if (!receipt) {
        receipt = await web3.eth.getTransactionReceipt(txHash)
      }
      if (!transaction || !receipt) {
        console.log(`error fetching ${!transaction ? 'transaction' : 'receipt'} for ${txHash}`)
        continue;
      }
      const txEvent = createTransactionEvent(transaction, receipt, block, networkId, traceMap[txHash.toLowerCase()])

      const findings = []
      for (const handleTransaction of transactionHandlers) {
        findings.push(...await handleTransaction(txEvent))
      }
      console.log(`${findings.length} findings for transaction ${txHash} ${findings}`)
    }
  }
}