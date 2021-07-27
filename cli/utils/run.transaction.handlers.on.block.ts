import Web3 from "web3";
import { BlockTransactionString } from "web3-eth"
import { assertExists, createTransactionEvent } from ".";
import { HandleTransaction } from "../../sdk";

export type RunTransactionHandlersOnBlock = (transactionHandlers: HandleTransaction[], block: BlockTransactionString) => Promise<void>

export function provideRunTransactionHandlersOnBlock(
  web3: Web3,
): RunTransactionHandlersOnBlock {
  assertExists(web3, 'web3')

  return async function runTransactionHandlersOnBlock(transactionHandlers: HandleTransaction[], block: BlockTransactionString) {
    if (!transactionHandlers?.length) return;
      
    const networkId = await web3.eth.net.getId()
    for (const txHash of block.transactions) {
      const [transaction, receipt] = await Promise.all([
        web3.eth.getTransaction(txHash), 
        web3.eth.getTransactionReceipt(txHash)
      ])
      const txEvent = createTransactionEvent(transaction, receipt, block, networkId)

      const findings = []
      for (const handleTransaction of transactionHandlers) {
        findings.push(...await handleTransaction(txEvent))
      }
      console.log(`${findings.length} findings for transaction ${txHash} ${findings}`)
    }
  }
}