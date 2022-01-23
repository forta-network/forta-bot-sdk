import os from 'os'
import fs from 'fs'
import { join } from 'path'
import { jsonc } from 'jsonc'
import _ from 'lodash'
import { Keccak } from 'sha3'
import { BlockEvent, EventType, FortaConfig, Network, Trace, TransactionEvent } from '.'
import { Transaction } from './transaction'
import { Receipt } from './receipt'
import { TxEventBlock } from './transaction.event'
import { Block } from './block'
import { ethers } from '.'

export const getEthersProvider = () => {
  return new ethers.providers.JsonRpcProvider(getJsonRpcUrl())
}

export const getEthersBatchProvider = () => {
  return new ethers.providers.JsonRpcBatchProvider(getJsonRpcUrl())
}

const getFortaConfig: () => FortaConfig = () => {
  let config = {}
  // try to read from global config
  const globalConfigPath = join(os.homedir(), '.forta', 'forta.config.json')
  if (fs.existsSync(globalConfigPath)) {
    config = Object.assign(config, jsonc.parse(fs.readFileSync(globalConfigPath, 'utf8')))
  }
  // try to read from local project config
  const configFlagIndex = process.argv.indexOf('--config')
  const configFile = configFlagIndex == -1 ? undefined : process.argv[configFlagIndex + 1]
  const localConfigPath = join(process.cwd(), configFile || 'forta.config.json')
  if (fs.existsSync(localConfigPath)) {
    config = Object.assign(config, jsonc.parse(fs.readFileSync(localConfigPath, 'utf8')))
  }
  return config
}

export const getJsonRpcUrl = () => {
  // if rpc url provided by Forta Scanner i.e. in production
  if (process.env.JSON_RPC_HOST) {
    return `http://${process.env.JSON_RPC_HOST}${process.env.JSON_RPC_PORT ? `:${process.env.JSON_RPC_PORT}` : ''}`
  }
  
  // else, use the rpc url from forta.config.json
  const { jsonRpcUrl } = getFortaConfig()
  if (!jsonRpcUrl) throw new Error('no jsonRpcUrl found')
  if (!jsonRpcUrl.startsWith("http")) throw new Error('jsonRpcUrl must begin with http(s)')
  return jsonRpcUrl
}

// utility function for writing TransactionEvent tests
export const createTransactionEvent = ({
  type = EventType.BLOCK,
  network = Network.MAINNET,
  transaction,
  receipt,
  traces = [],
  addresses = {},
  block
}: {
  type?: EventType,
  network?: Network,
  transaction: Transaction,
  receipt: Receipt,
  traces?: Trace[],
  addresses?: { [key: string]: boolean },
  block: TxEventBlock
}) => {
  return new TransactionEvent(type, network, transaction, receipt, traces, addresses, block)
}

// utility function for writing BlockEvent tests
export const createBlockEvent = ({
  type = EventType.BLOCK,
  network = Network.MAINNET,
  block
}: {
  type?: EventType,
  network?: Network,
  block: Block
}) => {
  return new BlockEvent(type, network, block)
}

export const assertIsNonEmptyString = (str: string, varName: string) => {
  if (!_.isString(str) || str.length === 0) {
    throw new Error(`${varName} must be non-empty string`);
  }
};

export const assertIsFromEnum = (value: any, Enum: any, varName: string) => {
  if (!Object.values(Enum).includes(value)) {
    throw new Error(`${varName} must be valid enum value`)
  }
}

export const keccak256 = (str: string) => {
  const hash = new Keccak(256)
  hash.update(str)
  return `0x${hash.digest('hex')}`
}

let IS_PRIVATE_FINDINGS = false
export const setPrivateFindings = (isPrivate: boolean) => {
  IS_PRIVATE_FINDINGS = isPrivate
}

export const isPrivateFindings = () => {
  return IS_PRIVATE_FINDINGS
}