import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import { jsonc } from 'jsonc'
import { Keccak } from 'sha3'
import { ShellString } from 'shelljs'
import { getContractAddress } from '@ethersproject/address'

import {
  Alert, AlertEvent,
  BlockEvent,
  EventType,
  Finding,
  TransactionEvent
} from "../../sdk"
import { Trace } from '../../sdk'
import { JsonRpcBlock, JsonRpcTransaction } from './get.block.with.transactions'
import { JsonRpcLog } from './get.transaction.receipt'

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

export const assertIsISOString = (str: string, fieldName?: string) => {
  const fieldNameText = fieldName ? `Field name ${fieldName}` : "";
  if(isNaN(Date.parse(str))) {
    throw new Error(`${fieldNameText} has invalid value. ${str} is not a valid ISO timestamp. The ISO format is: YYYY-MM-DDTHH:mmZ`)
  }
}

export const assertShellResult = (result: ShellString, errMsg: string) => {
  if (result.code !== 0) {
    throw new Error(`${errMsg}: ${result.stderr}`)
  }
}

export const assertFindings = (findings: Finding[]) => {
  const byteLength = Buffer.byteLength(JSON.stringify(findings));
  const kilobyte = 1024;

  if(byteLength > kilobyte * 10000) throw Error(`Cannot return more than 10MB of findings per request (received ${byteLength} bytes)`)
  if(findings.length > 1000) throw Error(`Cannot return more than 1000 findings per request (received ${findings.length})`)
}

export const assertIsValidChainSettings = (chainSettings?: any) => {
  if(!chainSettings) {
    return 
  }
  for(let key in chainSettings) {
    if(key == "default") {
      continue 
    }
    if(isNaN(parseInt(key))) {
      throw new Error("keys in chainSettings must be numerical string or default")
    }
  }
}

export const isValidTimeRange = (earliestTimestamp: Date, latestTimestamp: Date): boolean => {
  // If given a start range and end range
  return earliestTimestamp < latestTimestamp;
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

// creates a Forta BlockEvent from a json-rpc block object
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

// creates a Forta TransactionEvent from a json-rpc transaction receipt and block object
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
// creates a Forta AlertEvent from a public alert object
export type CreateAlertEvent = (alert: Alert) => AlertEvent
export const createAlertEvent: CreateAlertEvent = (
    alert: Alert
) => {

  return new AlertEvent(
    alert
  )
}

type NetworkName = "ethereum" | "polygon" | "binance_smart_chain" | "avalanche" | "arbitrum" | "optimism" | "fantom";

const DEFAULTS_BLOCK_TIME_IN_SECONDS = 15;

export interface BlockchainNetworkConfig {
  chainId: number,
  blockTimeInSeconds: number
}


export const getBlockChainNetworkConfig = (chainId: number): BlockchainNetworkConfig => {
  switch(chainId) {
    case(1): {
      return SUPPORTED_NETWORKS['ethereum']
    }
    case(137): {
      return SUPPORTED_NETWORKS['polygon']
    }
    case(56): {
      return SUPPORTED_NETWORKS['binance_smart_chain']
    }
    case(43114): {
      return SUPPORTED_NETWORKS['avalanche']
    }
    case(42161): {
      return SUPPORTED_NETWORKS['arbitrum']
    }
    case(10): {
      return SUPPORTED_NETWORKS['optimism']
    }
    case(250): {
      return SUPPORTED_NETWORKS['fantom']
    }
    default:
      return {
        chainId,
        blockTimeInSeconds: DEFAULTS_BLOCK_TIME_IN_SECONDS
      }
  }
}

const SUPPORTED_NETWORKS: {[key in NetworkName]: BlockchainNetworkConfig} = {
  "ethereum": {
    chainId: 1,
    blockTimeInSeconds: DEFAULTS_BLOCK_TIME_IN_SECONDS
  },
  "polygon": {
    chainId: 137,
    blockTimeInSeconds: 3 // https://polygonscan.com/chart/blocktime
  },
  "binance_smart_chain": {
    chainId: 56,
    blockTimeInSeconds: 5 // https://bscscan.com/chart/blocktime
  },
  "avalanche": {
    chainId: 43114,
    blockTimeInSeconds: 3 // https://avascan.info/
  },
  "arbitrum": {
    chainId: 42161,
    blockTimeInSeconds: DEFAULTS_BLOCK_TIME_IN_SECONDS
  },
  "optimism": {
    chainId: 10,
    blockTimeInSeconds: DEFAULTS_BLOCK_TIME_IN_SECONDS
  },
  "fantom": {
    chainId: 250,
    blockTimeInSeconds: 5 // https://ftmscan.com/chart/blocktime
  }
}
