import { EventType, Network } from "./index"
import { Log, Receipt } from "./receipt"
import { Trace } from "./trace"
import { Transaction } from "./transaction"
import { keccak256 } from "./utils"

export interface TxEventBlock {
  hash: string;
  number: number;
  timestamp: number;
}

export class TransactionEvent {
  constructor(
    readonly type: EventType,
    readonly network: Network,
    readonly transaction: Transaction,
    readonly receipt: Receipt,
    readonly traces: Trace[] = [],
    readonly addresses: { [key: string]: boolean },
    readonly block: TxEventBlock
  ) {}

  get hash() {
    return this.transaction.hash
  }

  get from() {
    return this.transaction.from
  }

  get to() {
    return this.transaction.to
  }

  get status() {
    return this.receipt.status
  }

  get gasUsed() {
    return this.receipt.gasUsed
  }

  get gasPrice() {
    return this.transaction.gasPrice
  }

  get logs() {
    return this.receipt.logs
  }

  get timestamp() {
    return this.block.timestamp
  }

  get blockNumber() {
    return this.block.number
  }

  get blockHash() {
    return this.block.hash
  }

  filterEvent(eventSignature: string, contractAddress?: string): Log[] {
    const eventTopic = keccak256(eventSignature).toLowerCase()
    const events = this.receipt.logs.filter(
      log => log.topics.length
        && log.topics[0].toLowerCase() === eventTopic
        && (contractAddress?.length ? log.address === contractAddress : true)
    )
    return events
  }
}