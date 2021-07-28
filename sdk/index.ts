import { Finding, FindingSeverity, FindingType } from "./finding"
import { BlockEvent } from "./block.event"
import { TransactionEvent } from "./transaction.event"
import { getFortaConfig, getJsonRpcUrl } from "./utils"

interface FortaConfig {
  agentId?: string
  version?: string
  jsonRpcUrl?: string
  ipfsGatewayUrl?: string
  ipfsGatewayAuth?: string
  imageRepositoryUrl?: string
  agentRegistryContractAddress?: string
  agentRegistryJsonRpcUrl?: string
  handlers?: string[]
  debug?: boolean
}

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
  HandleTransaction,
  HandleBlock,
  Finding,
  FindingSeverity,
  FindingType,
  BlockEvent,
  TransactionEvent,
  EventType,
  Network,
  getFortaConfig,
  getJsonRpcUrl
 }