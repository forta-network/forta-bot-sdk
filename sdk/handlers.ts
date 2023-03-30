import { AlertEvent } from "./alert.event"
import { BlockEvent } from "./block.event"
import { Finding } from "./finding"
import { InitializeResponse } from "./initialize.response"
import { TransactionEvent } from "./transaction.event"

export type Initialize = () => Promise<InitializeResponse | void>
export type HandleTransaction = (txEvent: TransactionEvent) => Promise<Finding[]>
export type HandleBlock = (blockEvent: BlockEvent) => Promise<Finding[]>
export type HandleAlert = (alertEvent: AlertEvent) => Promise<Finding[]>