import { Trace } from "../../sdk";
import { GetTraceData } from "./get.trace.data";
import { assertExists, CreateGrpcEvaluateBlockRequest, CreateGrpcEvaluateTxRequest, stringifyFindings } from ".";
import { GetNetworkId } from "./get.network.id";
import { GetBlockWithTransactions } from "./get.block.with.transactions";
import { JsonRpcLog } from "./get.transaction.receipt";
import { GetLogsForBlock } from "./get.logs.for.block";
import { GrpcHandleTransaction } from "../proto/grpc.handle.transaction";
import { GrpcHandleBlock } from "../proto/grpc.handle.block";

export type RunHandlersOnBlock = (blockHashOrNumber: string | number) => Promise<void>

export function provideRunHandlersOnBlock(
  getNetworkId: GetNetworkId,
  getBlockWithTransactions: GetBlockWithTransactions,
  getTraceData: GetTraceData,
  getLogsForBlock: GetLogsForBlock,
  createGrpcEvaluateBlockRequest: CreateGrpcEvaluateBlockRequest,
  grpcHandleBlock: GrpcHandleBlock,
  createGrpcEvaluateTxRequest: CreateGrpcEvaluateTxRequest,
  grpcHandleTransaction: GrpcHandleTransaction
): RunHandlersOnBlock {
  assertExists(getNetworkId, 'getNetworkId')
  assertExists(getBlockWithTransactions, 'getBlockWithTransactions')
  assertExists(getTraceData, 'getTraceData')
  assertExists(getLogsForBlock, 'getLogsForBlock')
  assertExists(createGrpcEvaluateBlockRequest, 'createGrpcEvaluateBlockRequest')
  assertExists(grpcHandleBlock, 'grpcHandleBlock')
  assertExists(createGrpcEvaluateTxRequest, 'createGrpcEvaluateTxRequest')
  assertExists(grpcHandleTransaction, 'grpcHandleTransaction')

  return async function runHandlersOnBlock(blockHashOrNumber: string | number) {
    console.log(`fetching block ${blockHashOrNumber}...`)
    const [networkId, block] = await Promise.all([
      getNetworkId(),
      getBlockWithTransactions(blockHashOrNumber)
    ]) 

    // run block handler
    const request = createGrpcEvaluateBlockRequest(block, networkId)
    const findings = await grpcHandleBlock(request)
    console.log(`${findings.length} findings for block ${block.hash} ${stringifyFindings(findings)}`)

    // get block logs and trace data to run transaction handler
    const blockNumber = parseInt(block.number)
    const [logs, traces] = await Promise.all([
      getLogsForBlock(blockNumber),
      getTraceData(blockNumber)
    ])

    // build map of logs for each transaction
    const logMap: { [txHash: string]: JsonRpcLog[] } = {}
    logs.forEach(log => {
      if (!log.transactionHash) return
      const txHash = log.transactionHash.toLowerCase()
      if (!logMap[txHash]) logMap[txHash] = []
      logMap[txHash].push(log)
    })

    // build map of trace data for each transaction
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
      const request = createGrpcEvaluateTxRequest(transaction, block, networkId, traceMap[txHash], logMap[txHash])
      const findings = await grpcHandleTransaction(request)
      console.log(`${findings.length} findings for transaction ${transaction.hash} ${stringifyFindings(findings)}`)
    }
  }
}



