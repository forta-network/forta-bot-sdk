import fs from 'fs'
import _ from 'lodash'
import { jsonc } from 'jsonc'
import { BlockTransactionString } from "web3-eth"
import { Transaction, TransactionReceipt } from "web3-core"
import { Keccak } from 'sha3'
import { EventType, TransactionEvent } from "../../sdk"
import { ShellString } from 'shelljs'

export type GetJsonFile = (path: string) => any
export const getJsonFile: GetJsonFile = (path: string) => {
  if (path.startsWith("./")) {
    path = path.replace("./", process.cwd()+"/")
  }
  const data = fs.readFileSync(path, 'utf8')
  return jsonc.parse(data)
}

export type IsTypescriptProject = () => boolean
export const isTypescriptProject = () => {
  const tsConfigPath = process.cwd()+"/tsconfig.json";
  return fs.existsSync(tsConfigPath)
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

export const createTransactionEvent = (transaction: Transaction, receipt: TransactionReceipt, blok: BlockTransactionString, networkId: number) => {
  const tx = {
    ...transaction,
    gas: transaction.gas.toString(),
    data: transaction.input,
    r: '',// TODO
    s: '',// TODO
    v: ''// TODO
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
  const addresses = {
    [tx.from]: true
  }
  if (tx.to) {
    addresses[tx.to] = true;
  }
  receipt.logs.forEach(log => addresses[log.address] = true)
  const block = {
    ...blok,
    timestamp: typeof blok.timestamp === 'string' ? parseInt(blok.timestamp) : blok.timestamp
  }
  return new TransactionEvent(
    EventType.BLOCK,
    networkId,
    tx,
    rcpt,
    [], // TODO figure out how to get traces
    addresses,
    block
  )
}