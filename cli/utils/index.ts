import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import { jsonc } from 'jsonc'
import { Keccak } from 'sha3'
import { ShellString } from 'shelljs'
import { getContractAddress } from '@ethersproject/address'

import { BlockEvent, EventType, TransactionEvent } from "../../sdk"
import { Trace } from '../../sdk/trace'
import { JsonRpcBlock, JsonRpcTransaction } from './get.block.with.transactions'
import { JsonRpcLog } from './get.transaction.receipt'
import { GrpcEvaluateBlockRequest, GrpcEvaluateTxRequest, GrpcEventType, GrpcFinding, GrpcFindingSeverity, GrpcFindingType } from '../proto/types'

export type GetJsonFile = (filePath: string) => any
export const getJsonFile: GetJsonFile = (filePath: string) => {
  if (filePath.startsWith(`.${path.sep}`)) {
    filePath = filePath.replace(`.${path.sep}`, `${process.cwd()}${path.sep}`)
  }
  const data = fs.readFileSync(filePath, 'utf8')
  return jsonc.parse(data)
}

export const assertExists = (obj: any, objName: string) => {
  if (_.isNil(obj)) throw new Error(`${objName} is required`)
}

export const assertIsNonEmptyString = (str: string, varName: string) => {
  if (!_.isString(str) || str.length === 0) {
    throw new Error(`${varName} must be non-empty string`);
  }
};

export const assertShellResult = (result: ShellString, errMsg: string) => {
  if (result.code !== 0) {
    throw new Error(`${errMsg}: ${result.stderr}`)
  }
}

export const keccak256 = (str: string) => {
  const hash = new Keccak(256)
  hash.update(str)
  return `0x${hash.digest('hex')}`
}

export const formatAddress = (address: string) => {
  return _.isString(address) ? address.toLowerCase() : address
}

export const isZeroAddress = (address: string | null) => {
  return "0x0000000000000000000000000000000000000000" === address
}

export const capitalizeFirstLetter = (word: string) => {
  if (!word || !word.length) return ''

  const firstLetter = word.charAt(0)
  const restOfWord = word.substring(1, word.length)
  return `${firstLetter.toUpperCase()}${restOfWord.toLowerCase()}`
}

export const stringifyFindings = (findings: GrpcFinding[]): string => {
  return findings.map(finding => JSON.stringify({
    name: finding.name,
    description: finding.description,
    alertId: finding.alertId,
    protocol: finding.protocol,
    severity: capitalizeFirstLetter(finding.severity.toString()),
    type: capitalizeFirstLetter(finding.type.toString()),
    metadata: finding.metadata,
    addresses: finding.addresses
  }, null, 2)).join('\n')
}

// creates a GrpcEvaluateBlockRequest from a raw json-rpc block
export type CreateGrpcEvaluateBlockRequest = (block: JsonRpcBlock, networkId: number) => GrpcEvaluateBlockRequest
export const createGrpcEvaluateBlockRequest: CreateGrpcEvaluateBlockRequest = (block: JsonRpcBlock, networkId: number) => {
  return {
    requestId: `${Date.now()}`,
    event: {
      type: GrpcEventType.BLOCK,
      network: {
        chainId: `${networkId}`
      },
      blockHash: block.hash,
      blockNumber: block.number,
      block: {
        difficulty: block.difficulty,
        extraData: block.extraData,
        gasLimit: block.gasLimit,
        gasUsed: block.gasUsed,
        hash: block.hash,
        logsBloom: block.logsBloom,
        miner: formatAddress(block.miner),
        mixHash: block.mixHash,
        nonce: block.nonce,
        number: block.number,
        parentHash: block.parentHash,
        receiptsRoot: block.receiptsRoot,
        sha3Uncles: block.sha3Uncles,
        size: block.size,
        stateRoot: block.stateRoot,
        timestamp: block.timestamp,
        totalDifficulty: block.totalDifficulty,
        transactions: block.transactions.map(tx => tx.hash),
        transactionsRoot: block.transactionsRoot,
        uncles: block.uncles
      }
    }
  }
}

// creates a GrpcEvaluateTxRequest from a raw json-rpc transaction and block
export type CreateGrpcEvaluateTxRequest = (transaction: JsonRpcTransaction, block: JsonRpcBlock, networkId: number, traces: Trace[], logs: JsonRpcLog[]) => GrpcEvaluateTxRequest
export const createGrpcEvaluateTxRequest: CreateGrpcEvaluateTxRequest = (
  transaction: JsonRpcTransaction,
  block: JsonRpcBlock, 
  networkId: number, 
  traces: Trace[] = [],
  logs: JsonRpcLog[] = []
) => {
  const addresses = {
    [formatAddress(transaction.from)]: true
  }
  if (transaction.to) {
    addresses[formatAddress(transaction.to)] = true;
  }
  traces.forEach(trace => {
    addresses[formatAddress(trace.action.address)] = true
    addresses[formatAddress(trace.action.refundAddress)] = true
    addresses[formatAddress(trace.action.to)] = true
    addresses[formatAddress(trace.action.from)] = true
  })
  logs.forEach(log => addresses[formatAddress(log.address)] = true)
  const contractAddress = isZeroAddress(transaction.to) ? formatAddress(getContractAddress({ from: transaction.from, nonce: transaction.nonce })) : ''

  return {
    requestId: `${Date.now()}`,
    event: {
      type: GrpcEventType.BLOCK,
      network: {
        chainId: `${networkId}`
      },
      transaction: {
        type: '',
        nonce: transaction.nonce,
        gasPrice: transaction.gasPrice,
        gas: transaction.gas,
        value: transaction.value,
        input: transaction.input,
        v: transaction.v,
        r: transaction.r,
        s: transaction.s,
        to: transaction.to ? formatAddress(transaction.to) : '',
        hash: transaction.hash,
        from: formatAddress(transaction.from)
      },
      receipt: {
        root: '',
        status: "0x1",
        cumulativeGasUsed: '',
        logsBloom: '',
        logs: logs,
        transactionHash: transaction.hash,
        contractAddress: contractAddress,
        gasUsed: transaction.gas,
        blockHash: block.hash,
        blockNumber: block.number,
        transactionIndex: ''
      },
      block: {
        blockHash: block.hash,
        blockNumber: block.number,
        blockTimestamp: block.timestamp
      },
      addresses: addresses,
      traces: traces,
      logs: logs,
      isContractDeployment: isZeroAddress(transaction.to),
      contractAddress: contractAddress
    }
  }
}

// creates a SDK BlockEvent from a raw json-rpc block
export type CreateBlockEvent = (block: JsonRpcBlock, networkId: number) => BlockEvent
export const createBlockEvent: CreateBlockEvent = (block: JsonRpcBlock, networkId: number) => {
  const blok = {
    difficulty: block.difficulty,
    extraData: block.extraData,
    gasLimit: block.gasLimit,
    gasUsed: block.gasUsed,
    hash: block.hash,
    logsBloom: block.logsBloom,
    miner: formatAddress(block.miner),
    mixHash: block.mixHash,
    nonce: block.nonce,
    number: parseInt(block.number),
    parentHash: block.parentHash,
    receiptsRoot: block.receiptsRoot,
    sha3Uncles: block.sha3Uncles,
    size: block.size,
    stateRoot: block.stateRoot,
    timestamp: parseInt(block.timestamp),
    totalDifficulty: block.totalDifficulty,
    transactions: block.transactions.map(tx => tx.hash),
    transactionsRoot: block.transactionsRoot,
    uncles: block.uncles
  }
  return new BlockEvent(EventType.BLOCK, networkId, blok)
}

// creates a SDK TransactionEvent from a raw json-rpc transaction and block
export type CreateTransactionEvent = (transaction: JsonRpcTransaction, block: JsonRpcBlock, networkId: number, traces: Trace[], logs: JsonRpcLog[]) => TransactionEvent
export const createTransactionEvent: CreateTransactionEvent = (
  transaction: JsonRpcTransaction, 
  block: JsonRpcBlock, 
  networkId: number, 
  traces: Trace[] = [],
  logs: JsonRpcLog[] = []
) => {
  const tx = {
    hash: transaction.hash,
    from: formatAddress(transaction.from),
    to: transaction.to ? formatAddress(transaction.to) : null,
    nonce: parseInt(transaction.nonce),
    gas: transaction.gas,
    gasPrice: transaction.gasPrice,
    value: transaction.value,
    data: transaction.input,
    r: transaction.r,
    s: transaction.s,
    v: transaction.v,
  }
  const addresses = {
    [tx.from]: true
  }
  if (tx.to) {
    addresses[tx.to] = true;
  }

  const blok = {
    hash: block.hash,
    number: parseInt(block.number),
    timestamp: parseInt(block.timestamp)
  }

  const trcs: Trace[] = []
  traces.forEach(trace => {
    addresses[formatAddress(trace.action.address)] = true
    addresses[formatAddress(trace.action.refundAddress)] = true
    addresses[formatAddress(trace.action.to)] = true
    addresses[formatAddress(trace.action.from)] = true

    trcs.push({
      action: {
        callType: trace.action.callType,
        to: formatAddress(trace.action.to),
        input: trace.action.input,
        from: formatAddress(trace.action.from),
        value: trace.action.value,
        init: trace.action.init,
        address: formatAddress(trace.action.address),
        balance: trace.action.balance,
        refundAddress: formatAddress(trace.action.refundAddress),
      },
      blockHash: trace.blockHash,
      blockNumber: trace.blockNumber,
      result: {
        gasUsed: trace.result?.gasUsed,
        address: trace.result?.address,
        code: trace.result?.code,
        output: trace.result?.output
      },
      subtraces: trace.subtraces,
      traceAddress: trace.traceAddress,
      transactionHash: trace.transactionHash,
      transactionPosition: trace.transactionPosition,
      type: trace.type,
      error: trace.error,
    })
  })

  const lgs = logs.map(log => ({
    address: formatAddress(log.address),
    topics: log.topics,
    data: log.data,
    logIndex: parseInt(log.logIndex),
    blockNumber: parseInt(log.blockNumber),
    blockHash: log.blockHash,
    transactionIndex: parseInt(log.transactionIndex),
    transactionHash: log.transactionHash,
    removed: log.removed,
  }))
  lgs.forEach(log => addresses[log.address] = true)

  let contractAddress = null
  if (isZeroAddress(transaction.to)) {
    contractAddress = formatAddress(getContractAddress({ from: transaction.from, nonce: transaction.nonce }))
  }

  return new TransactionEvent(
    EventType.BLOCK,
    networkId,
    tx,
    trcs,
    addresses,
    blok,
    lgs,
    contractAddress
  )
}