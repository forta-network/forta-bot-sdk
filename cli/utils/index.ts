import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import { jsonc } from 'jsonc'
import { BlockTransactionString } from "web3-eth"
import { Transaction, TransactionReceipt } from "web3-core"
import { Keccak } from 'sha3'
import { ShellString } from 'shelljs'
import { EventType, TransactionEvent } from "../../sdk"
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

export const createTransactionEvent = (
  transaction: Transaction, 
  receipt: TransactionReceipt, 
  blok: BlockTransactionString, 
  networkId: number, 
  traces: Trace[] = []
) => {
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
  receipt.logs.forEach(log => addresses[log.address] = true)

  const block = {
    hash: blok.hash,
    number: blok.number,
    timestamp: typeof blok.timestamp === 'string' ? parseInt(blok.timestamp) : blok.timestamp
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
    block
  )
}