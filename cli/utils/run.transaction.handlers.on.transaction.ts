import Web3 from "web3";
import { assertExists, createTransactionEvent } from ".";
import { HandleTransaction } from "../../sdk";
import { GetTraceData } from "./get.trace.data";

export type RunTransactionHandlersOnTransaction = (transactionHandlers: HandleTransaction[], txHash: string) => Promise<void>

export function provideRunTransactionHandlersOnTransaction(
  web3: Web3,
  getTraceData: GetTraceData
): RunTransactionHandlersOnTransaction {
  assertExists(web3, 'web3')
  assertExists(getTraceData, 'getTraceData')

  return async function runTransactionHandlersOnTransaction(transactionHandlers: HandleTransaction[], txHash: string) {
    if (!transactionHandlers?.length) return;
      
    const networkId = await web3.eth.net.getId()
    const [transaction, receipt] = await Promise.all([
      web3.eth.getTransaction(txHash), 
      web3.eth.getTransactionReceipt(txHash)
    ])
    const block = await web3.eth.getBlock(transaction.blockHash!)
    const traces = await getTraceData(transaction.hash)
    const txEvent = createTransactionEvent(transaction, receipt, block, networkId, traces)

    const findings = []
    for (const handleTransaction of transactionHandlers) {
      findings.push(...await handleTransaction(txEvent))
    }
    console.log(`${findings.length} findings for transaction ${txHash} ${findings}`)
  }
}