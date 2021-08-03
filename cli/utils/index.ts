import fs from 'fs'
import _ from 'lodash'
import { jsonc } from 'jsonc'
import { BlockTransactionString } from "web3-eth"
import { Transaction, TransactionReceipt } from "web3-core"
import { Keccak } from 'sha3'
import { ShellString } from 'shelljs'
import { EventType, TransactionEvent } from "../../sdk"
import { Trace } from '../../sdk/trace'

export type GetJsonFile = (path: string) => any
export const getJsonFile: GetJsonFile = (path: string) => {
  if (path.startsWith("./")) {
    path = path.replace("./", process.cwd()+"/")
  }
  const data = fs.readFileSync(path, 'utf8')
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

export const createTransactionEvent = (
  transaction: Transaction, 
  receipt: TransactionReceipt, 
  blok: BlockTransactionString, 
  networkId: number, 
  traces: Trace[] = []
) => {
  const tx = {
    ...transaction,
    gas: transaction.gas.toString(),
    data: transaction.input,
    r: '',// TODO
    s: '',// TODO
    v: ''// TODO
  }
  const addresses = {
    [tx.from]: true
  }
  if (tx.to) {
    addresses[tx.to] = true;
  }

  const rcpt = {
    ...receipt,
    gasUsed: receipt.gasUsed.toString(),
    cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
    logs: receipt.logs.map(log => ({
      ...log,
      removed: false,
    })),
    contractAddress: receipt.contractAddress ? receipt.contractAddress : null,
    root: '',//TODO
  }  
  receipt.logs.forEach(log => addresses[log.address] = true)

  const block = {
    ...blok,
    timestamp: typeof blok.timestamp === 'string' ? parseInt(blok.timestamp) : blok.timestamp
  }

  traces.forEach(trace => {
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