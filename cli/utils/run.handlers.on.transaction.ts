import { assertExists, CreateGrpcEvaluateTxRequest, stringifyFindings } from ".";
import { GetBlockWithTransactions } from "./get.block.with.transactions";
import { GetNetworkId } from "./get.network.id";
import { GetTraceData } from "./get.trace.data";
import { GetTransactionReceipt } from "./get.transaction.receipt";
import { GrpcHandleTransaction } from "../proto/grpc.handle.transaction";

export type RunHandlersOnTransaction = (txHash: string) => Promise<void>

export function provideRunHandlersOnTransaction(
  getNetworkId: GetNetworkId,
  getTransactionReceipt: GetTransactionReceipt,
  getBlockWithTransactions: GetBlockWithTransactions,
  getTraceData: GetTraceData,
  createGrpcEvaluateTxRequest: CreateGrpcEvaluateTxRequest,
  grpcHandleTransaction: GrpcHandleTransaction
): RunHandlersOnTransaction {
  assertExists(getNetworkId, 'getNetworkId')
  assertExists(getTransactionReceipt, 'getTransactionReceipt')
  assertExists(getBlockWithTransactions, 'getBlockWithTransactions')
  assertExists(getTraceData, 'getTraceData')
  assertExists(createGrpcEvaluateTxRequest, 'createGrpcEvaluateTxRequest')
  assertExists(grpcHandleTransaction, 'grpcHandleTransaction')

  return async function runHandlersOnTransaction(txHash: string) {
    const [ networkId, receipt, traces ] = await Promise.all([
      getNetworkId(),
      getTransactionReceipt(txHash),
      getTraceData(txHash)
    ])
    const block = await getBlockWithTransactions(parseInt(receipt.blockNumber))

    txHash = txHash.toLowerCase()
    const transaction = block.transactions.find(tx => tx.hash.toLowerCase() === txHash)!
    const request = createGrpcEvaluateTxRequest(transaction, block, networkId, traces, receipt.logs)
    const findings = await grpcHandleTransaction(request)
    console.log(`${findings.length} findings for transaction ${txHash} ${stringifyFindings(findings)}`)
  }
}