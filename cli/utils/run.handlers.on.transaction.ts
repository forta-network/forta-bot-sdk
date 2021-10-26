import { providers } from "ethers"
import { assertExists, CreateTransactionEvent } from ".";
import { GetAgentHandlers } from "./get.agent.handlers";
import { GetTraceData } from "./get.trace.data";

export type RunHandlersOnTransaction = (txHash: string) => Promise<void>

export function provideRunHandlersOnTransaction(
  ethersProvider: providers.JsonRpcProvider,
  getAgentHandlers: GetAgentHandlers,
  getTraceData: GetTraceData,
  createTransactionEvent: CreateTransactionEvent
): RunHandlersOnTransaction {
  assertExists(ethersProvider, 'ethersProvider')
  assertExists(getAgentHandlers, 'getAgentHandlers')
  assertExists(getTraceData, 'getTraceData')
  assertExists(createTransactionEvent, 'createTransactionEvent')

  return async function runHandlersOnTransaction(txHash: string) {
    const { handleTransaction } = await getAgentHandlers()
    if (!handleTransaction) {
      throw new Error("no transaction handler found")
    }
      
    const networkId = (await ethersProvider.getNetwork()).chainId
    const receipt = await ethersProvider.getTransactionReceipt(txHash)
    const block = await ethersProvider.getBlockWithTransactions(receipt.blockHash)
    const traces = await getTraceData(receipt.transactionHash)
    const txEvent = createTransactionEvent(receipt, block, networkId, traces)

    const findings = await handleTransaction(txEvent)
    console.log(`${findings.length} findings for transaction ${txHash} ${findings}`)
  }
}