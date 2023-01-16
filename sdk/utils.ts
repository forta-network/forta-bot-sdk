import os from 'os'
import fs from 'fs'
import { join } from 'path'
import { jsonc } from 'jsonc'
import _ from 'lodash'
import { Keccak } from 'sha3'
import {
  Alert,
  AlertEvent,
  BlockEvent,
  EventType,
  FortaConfig,
  Network,
  Trace,
  TransactionEvent
} from '.'
import { Transaction } from './transaction'
import { Log, Receipt } from './receipt'
import { TxEventBlock } from './transaction.event'
import { Block } from './block'
import { ethers } from '.'
import { toUtf8Bytes } from "@ethersproject/strings"
import { AlertQueryOptions, AlertsResponse, FORTA_GRAPHQL_URL, getQueryFromAlertOptions, RawGraphqlAlertResponse } from './graphql/forta'
import axios, { AxiosInstance } from 'axios'

export const getEthersProvider = () => {
  return new ethers.providers.JsonRpcProvider(getJsonRpcUrl())
}

export const getEthersBatchProvider = () => {
  return new ethers.providers.JsonRpcBatchProvider(getJsonRpcUrl())
}

export const mockJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJib3QtaWQiOiIweDEzazM4N2IzNzc2OWNlMjQyMzZjNDAzZTc2ZmMzMGYwMWZhNzc0MTc2ZTE0MTZjODYxeWZlNmMwN2RmZWY3MWYiLCJleHAiOjE2NjAxMTk0NDMsImlhdCI6MTY2MDExOTQxMywianRpIjoicWtkNWNmYWQtMTg4NC0xMWVkLWE1YzktMDI0MjBhNjM5MzA4IiwibmJmIjoxNjYwMTE5MzgzLCJzdWIiOiIweDU1NmY4QkU0MmY3NmMwMUY5NjBmMzJDQjE5MzZEMmUwZTBFYjNGNEQifQ.9v5OiiYhDoEbhZ-abbiSXa5y-nQXa104YCN_2mK7SP0';


const getAxiosInstance = () => {
  return axios.create();
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
  let { jsonRpcUrl } = getFortaConfig()
  if (!jsonRpcUrl) return "https://cloudflare-eth.com/"
  if (!jsonRpcUrl.startsWith("http")) throw new Error('jsonRpcUrl must begin with http(s)')
  return jsonRpcUrl
}

export const getTransactionReceipt: (txHash: string) => Promise<Receipt> = async (txHash: string) => {
  const ethersProvider = getEthersProvider()
  const jsonReceipt = await ethersProvider.send(
    'eth_getTransactionReceipt',
    [txHash]
  )
  const receipt = {
    blockNumber: parseInt(jsonReceipt.blockNumber),
    blockHash: jsonReceipt.blockHash,
    transactionIndex: parseInt(jsonReceipt.transactionIndex),
    transactionHash: jsonReceipt.transactionHash,
    status: jsonReceipt.status === "0x1",
    logsBloom: jsonReceipt.logsBloom,
    contractAddress: jsonReceipt.contractAddress ? jsonReceipt.contractAddress.toLowerCase() : null,
    gasUsed: jsonReceipt.gasUsed,
    cumulativeGasUsed: jsonReceipt.cumulativeGasUsed,
    logs: jsonReceipt.logs.map((log: any) => ({
      address: log.address.toLowerCase(),
      topics: log.topics,
      data: log.data,
      logIndex: parseInt(log.logIndex),
      blockNumber: parseInt(log.blockNumber),
      blockHash: log.blockHash,
      transactionIndex: parseInt(log.transactionIndex),
      transactionHash: log.transactionHash,
      removed: log.removed,
    })),
    root: jsonReceipt.root ?? '',
  }
  return receipt
}

// utility function for writing TransactionEvent tests
export const createTransactionEvent = ({
  type = EventType.BLOCK,
  network = Network.MAINNET,
  transaction,
  traces = [],
  addresses = {},
  block,
  logs = [],
  contractAddress
}: {
  type?: EventType,
  network?: Network,
  transaction: Transaction,
  traces?: Trace[],
  addresses?: { [key: string]: boolean },
  block: TxEventBlock,
  logs: Log[],
  contractAddress: string | null
}) => {
  return new TransactionEvent(type, network, transaction, traces, addresses, block, logs, contractAddress)
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

// utility function for writing AlertEvent tests
export const createAlertEvent = ({
  alert
}: {
  alert: Alert
}) => {
  return new AlertEvent(alert)
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

export const getAlerts = async (query: AlertQueryOptions): Promise<AlertsResponse> => {
  const response: RawGraphqlAlertResponse = await axios.post(FORTA_GRAPHQL_URL, getQueryFromAlertOptions(query), {headers: {"content-type": "application/json"}});

  if(response.data && response.data.errors) throw Error(response.data.errors)

  return response.data.data.alerts
}

export const fetchJwt = async (claims: {} = {}, expiresAt?: Date, axiosInstance: AxiosInstance = getAxiosInstance()): Promise<{token: string} | null> => {
  const hostname = 'forta-jwt-provider'
  const port = 8515
  const path = '/create'

  let fullClaims = {...claims}

  if(expiresAt) {
    const expInSec = Math.floor(expiresAt.getTime()/1000);

    // This covers the edge case where a Date that causes a seconds value to have number overflow resulting in a null exp
    const safeExpInSec = expInSec > Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : expInSec;

    fullClaims = {
      exp: safeExpInSec,
      ...fullClaims
    }
  }

  const data = {
    claims: fullClaims
  }

  try {
    const response = await axiosInstance.post(`http://${hostname}:${port}${path}`, data)
    return response.data
  } catch(err) {
    // If bot not running in production mode return a mock JWT
    if(process.env.NODE_ENV !== 'production') {
      return {token: mockJwt};
    }
    throw err
  }
}

interface DecodedJwt {
  header: any,
  payload: any
}

export const decodeJwt = (token: string): DecodedJwt => {

  const splitJwt = (token).split('.');
  const header = JSON.parse(Buffer.from(splitJwt[0], 'base64').toString())
  const payload = JSON.parse(Buffer.from(splitJwt[1], 'base64').toString())

  return {
    header,
    payload
  }
}

const DISPTACHER_ARE_THEY_LINKED = "function areTheyLinked(uint256 agentId, uint256 scannerId) external view returns(bool)";
const DISPATCH_CONTRACT = "0xd46832F3f8EA8bDEFe5316696c0364F01b31a573"; // Source: https://docs.forta.network/en/latest/smart-contracts/

export const verifyJwt = async (token: string, polygonRpcUrl: string = "https://polygon-rpc.com"): Promise<boolean> => {
  const splitJwt = (token).split('.')
  const rawHeader = splitJwt[0]
  const rawPayload = splitJwt[1]

  const header = JSON.parse(Buffer.from(rawHeader, 'base64').toString())
  const payload = JSON.parse(Buffer.from(rawPayload, 'base64').toString())

  const botId = payload["bot-id"] as string
  const expiresAt = payload["exp"] as number
  const algorithm = header?.alg;

  if(algorithm !== "ETH") {
    console.warn(`Unexpected signing method: ${algorithm}`)
    return false
  }

  if(!botId) {
    console.warn(`Invalid claim`)
    return false
  }

  const signerAddress = payload?.sub as string | undefined // public key should be contract address that signed the JWT

  if(!signerAddress) {
    console.warn(`Invalid claim`)
    return false
  }

  const currentUnixTime = Math.floor((Date.now() / 1000))

  if(expiresAt < currentUnixTime) {
    console.warn(`Jwt is expired`)
    return false
  }

  const digest = ethers.utils.keccak256(toUtf8Bytes(`${rawHeader}.${rawPayload}`))
  const signature = `0x${ Buffer.from(splitJwt[2], 'base64').toString('hex')}`

  const recoveredSignerAddress = ethers.utils.recoverAddress(digest, signature) // Contract address that signed message

  if(recoveredSignerAddress !== signerAddress) {
    console.warn(`Signature invalid: expected=${signerAddress}, got=${recoveredSignerAddress}`)
    return false
  }

  const polygonProvider = new ethers.providers.JsonRpcProvider(polygonRpcUrl)

  const dispatchContract = new ethers.Contract(DISPATCH_CONTRACT, [DISPTACHER_ARE_THEY_LINKED], polygonProvider)
  const areTheyLinked = await dispatchContract.areTheyLinked(botId, recoveredSignerAddress)
  
  return areTheyLinked
}