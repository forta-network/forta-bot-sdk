import { ethers } from "ethers"
import { Finding, FindingSeverity, FindingType } from "./finding"
import { BlockEvent } from "./block.event"
import {AlertEvent} from "./alert.event";
import { Block } from "./block"
import { Alert } from "./alert"
import { TransactionEvent, TxEventBlock, LogDescription } from "./transaction.event"
import { Log, Receipt } from "./receipt"
import { Trace, TraceAction, TraceResult } from "./trace"
import { Transaction } from "./transaction"
import { 
  createBlockEvent, 
  createTransactionEvent,
  createAlertEvent,
  getJsonRpcUrl, 
  getEthersProvider, 
  getEthersBatchProvider, 
  keccak256,
  setPrivateFindings,
  isPrivateFindings,
  getTransactionReceipt,
  getAlerts,
  fetchJwt,
  decodeJwt,
  verifyJwt
} from "./utils"
import awilixConfigureContainer from '../cli/di.container';
import {InitializeResponse} from "./initialize_response";

interface DiContainer {
  resolve<T>(key: string): T
}
type ConfigureContainer = (args?: object) => DiContainer
const configureContainer: ConfigureContainer = (args: object = {}) => {
  return awilixConfigureContainer(args)
}

interface FortaConfig {
  agentId?: string
  jsonRpcUrl?: string
  ipfsGatewayUrl?: string
  ipfsGatewayAuth?: string
  imageRepositoryUrl?: string
  imageRepositoryUsername?: string
  imageRepositoryPassword?: string
  agentRegistryContractAddress?: string
  agentRegistryJsonRpcUrl?: string
  debug?: boolean
  traceRpcUrl?: string
  traceBlockMethod?: string
  traceTransactionMethod?: string
  keyfile?: string
  keyfilePassword?: string
}

type Initialize = () => Promise<InitializeResponse>
type HandleTransaction = (txEvent: TransactionEvent) => Promise<Finding[]>
type HandleBlock = (blockEvent: BlockEvent) => Promise<Finding[]>
type HandleAlert = (alertEvent: AlertEvent) => Promise<Finding[]>

enum EventType {
  BLOCK = 0,
  REORG = 1,
}

enum Network {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GOERLI = 5,
  POLYGON = 137,
  BSC = 56,
  AVALANCHE = 43114,
  ARBITRUM = 42161,
  OPTIMISM = 10,
  FANTOM = 250,
}

export {
  FortaConfig,
  Initialize,
  HandleTransaction,
  HandleBlock,
  HandleAlert,
  Finding,
  FindingSeverity,
  FindingType,
  BlockEvent,
  TransactionEvent,
  AlertEvent,
  TxEventBlock,
  Alert,
  Block,
  Transaction,
  Receipt,
  Log,
  LogDescription,
  Trace,
  TraceAction,
  TraceResult,
  EventType,
  Network,
  getJsonRpcUrl,
  createTransactionEvent,
  createBlockEvent,
  createAlertEvent,
  getEthersProvider,
  getEthersBatchProvider,
  ethers,
  keccak256,
  setPrivateFindings,
  isPrivateFindings,
  configureContainer,
  getTransactionReceipt,
  getAlerts,
  fetchJwt,
  decodeJwt,
  verifyJwt
 }