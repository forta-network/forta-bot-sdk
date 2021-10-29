import { Finding, FindingSeverity, FindingType } from "./finding"
import { BlockEvent } from "./block.event"
import { Block } from "./block"
import { TransactionEvent, TxEventBlock } from "./transaction.event"
import { createBlockEvent, createTransactionEvent, getFortaConfig, getJsonRpcUrl } from "./utils"
import { Log, Receipt } from "./receipt"
import { Trace, TraceAction, TraceResult } from "./trace"
import { Transaction } from "./transaction"

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
  Trace,
  TraceAction,
  TraceResult,
  EventType,
  Network,
  getFortaConfig,
  getJsonRpcUrl,
  createTransactionEvent,
  createBlockEvent
 }