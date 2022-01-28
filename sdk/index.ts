import { ethers } from "ethers"
import { Finding, FindingSeverity, FindingType } from "./finding"
import { BlockEvent } from "./block.event"
import { Block } from "./block"
import { TransactionEvent, TxEventBlock, LogDescription } from "./transaction.event"
import { Log, Receipt } from "./receipt"
import { Trace, TraceAction, TraceResult } from "./trace"
import { Transaction } from "./transaction"
import { 
  createBlockEvent, 
  createTransactionEvent, 
  getJsonRpcUrl, 
  getEthersProvider, 
  getEthersBatchProvider, 
  keccak256,
  setPrivateFindings,
  isPrivateFindings
} from "./utils"

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
}

type Initialize = () => Promise<void>
type HandleTransaction = (txEvent: TransactionEvent) => Promise<Finding[]>
type HandleBlock = (blockEvent: BlockEvent) => Promise<Finding[]>

enum EventType {
  BLOCK = 0,
  REORG = 1,
}

enum Network {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GOERLI = 5
}

export {
  FortaConfig,
  Initialize,
  HandleTransaction,
  HandleBlock,
  Finding,
  FindingSeverity,
  FindingType,
  BlockEvent,
  TransactionEvent,
  TxEventBlock,
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
  getEthersProvider,
  getEthersBatchProvider,
  ethers,
  keccak256,
  setPrivateFindings,
  isPrivateFindings
 }