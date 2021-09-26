import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import { jsonc } from 'jsonc'
import { BlockTransactionObject } from "web3-eth"
import { TransactionReceipt } from "web3-core"
import { Keccak } from 'sha3'
import { ShellString } from 'shelljs'
import { BlockEvent, EventType, TransactionEvent } from "../../sdk"
import { Trace } from '../../sdk/trace'

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

// creates a Forta BlockEvent from a web3 BlockTransactionObject
export const createBlockEvent = (block: BlockTransactionObject, networkId: number) => {
  const blok = {
    difficulty: block.difficulty.toString(),
    extraData: block.extraData,
    gasLimit: block.gasLimit.toString(),
    gasUsed: block.gasUsed.toString(),
    hash: block.hash,
    logsBloom: block.logsBloom,
    miner: formatAddress(block.miner),
    mixHash: '',//TODO
    nonce: block.nonce,
    number: block.number,
    parentHash: block.parentHash,
    receiptsRoot: block.receiptRoot,
    sha3Uncles: block.sha3Uncles,
    size: block.size.toString(),
    stateRoot: block.stateRoot,
    timestamp: typeof block.timestamp === 'string' ? parseInt(block.timestamp) : block.timestamp,
    totalDifficulty: block.totalDifficulty.toString(),
    transactions: block.transactions.map(tx => tx.hash),
    transactionsRoot: block.transactionRoot,
    uncles: block.uncles
  }
  return new BlockEvent(EventType.BLOCK, networkId, block.hash, block.number, blok)
}

// creates a Forta TransactionEvent from a web3 TransactionReceipt and BlockTransactionObject
export type CreateTransactionEvent = (receipt: TransactionReceipt, block: BlockTransactionObject, networkId: number, traces: Trace[]) => TransactionEvent
export const createTransactionEvent: CreateTransactionEvent = (
  receipt: TransactionReceipt, 
  block: BlockTransactionObject, 
  networkId: number, 
  traces: Trace[] = []
) => {
  const transaction = block.transactions.find(tx => tx.hash === receipt.transactionHash)!
  const tx = {
    hash: transaction.hash,
    from: formatAddress(transaction.from),
    to: transaction.to ? formatAddress(transaction.to) : null,
    nonce: transaction.nonce,
    gas: transaction.gas.toString(),
    gasPrice: transaction.gasPrice,
    value: transaction.value,
    data: transaction.input,
    r: (transaction as any).r,
    s: (transaction as any).s,
    v: (transaction as any).v,
  }
  const addresses = {
    [tx.from]: true
  }
  if (tx.to) {
    addresses[tx.to] = true;
  }

  const rcpt = {
    blockNumber: receipt.blockNumber,
    blockHash: receipt.blockHash,
    transactionIndex: receipt.transactionIndex,
    transactionHash: receipt.transactionHash,
    status: receipt.status,
    logsBloom: receipt.logsBloom,
    contractAddress: receipt.contractAddress ? formatAddress(receipt.contractAddress) : null,
    gasUsed: receipt.gasUsed.toString(),
    cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
    logs: receipt.logs.map(log => ({
      address: formatAddress(log.address),
      topics: log.topics,
      data: log.data,
      logIndex: log.logIndex,
      blockNumber: log.blockNumber,
      blockHash: log.blockHash,
      transactionIndex: log.transactionIndex,
      transactionHash: log.transactionHash,
      removed: false,
    })),
    root: (receipt as any).root ?? '',
  }  
  rcpt.logs.forEach(log => addresses[log.address] = true)

  const blok = {
    hash: block.hash,
    number: block.number,
    timestamp: typeof block.timestamp === 'string' ? parseInt(block.timestamp) : block.timestamp
  }

  traces.forEach(trace => {
    trace.action.address = formatAddress(trace.action.address)
    trace.action.refundAddress = formatAddress(trace.action.refundAddress)
    trace.action.to = formatAddress(trace.action.to)
    trace.action.from = formatAddress(trace.action.from)
    addresses[trace.action.address] = true
    addresses[trace.action.refundAddress] = true
    addresses[trace.action.to] = true
    addresses[trace.action.from] = true
  })

  return new TransactionEvent(
    EventType.BLOCK,
    networkId,
    tx,
    rcpt,
    traces,
    addresses,
    blok
  )
}