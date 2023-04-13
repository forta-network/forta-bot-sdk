import { ethers } from "ethers"
import { Finding, FindingSeverity, FindingType } from "./finding"
import { Label, EntityType } from "./label"
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
  getChainId,
  getBotOwner,
  getBotId
} from "./utils"
import {
  GetAlerts,
  AlertQueryOptions,
  AlertsResponse,
  AlertCursor,
  getAlerts
} from "./alerts.api"
import {
  fetchJwt,
  decodeJwt,
  verifyJwt,
  MOCK_JWT
} from "./jwt"
import awilixConfigureContainer from '../cli/di.container';
import { InitializeResponse, BotSubscription } from "./initialize.response";
import { BloomFilter } from "./bloom.filter";
import { FortaConfig } from "./forta.config";
import { EventType } from './event.type'
import { Network } from "./network";
import { Initialize, HandleTransaction, HandleBlock, HandleAlert } from "./handlers";

interface DiContainer {
  resolve<T>(key: string): T
}
type ConfigureContainer = (args?: object) => DiContainer
const configureContainer: ConfigureContainer = (args: object = {}) => {
  return awilixConfigureContainer(args)
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
  Label,
  EntityType,
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
  GetAlerts,
  AlertQueryOptions,
  AlertsResponse,
  AlertCursor,
  InitializeResponse,
  BotSubscription,
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
  verifyJwt,
  getChainId,
  getBotOwner,
  getBotId,
  BloomFilter,
  MOCK_JWT
 }