import { Block } from "./block"
import { EventType, Network } from "./index"
import { Receipt } from "./receipt"
import { Trace } from "./trace"
import { Transaction } from "./transaction"
import { keccak256 } from "./utils"

export class TransactionEvent {
  constructor(
    readonly type: EventType,
    readonly network: Network,
    readonly transaction: Transaction,
    readonly receipt: Receipt,
    readonly traces: Trace[] = [],
    readonly addresses: { [key: string]: boolean },
    readonly block: Block
  ) {}

  get gasUsed() {
    return this.receipt.gasUsed
  }

  hasEvent(eventSignature: string, contractAddress?: string): boolean {
    const eventTopic = keccak256(eventSignature).toLowerCase()
    const event = this.receipt.logs.find(
      log => log.topics.length
        && log.topics[0].toLowerCase() === eventTopic
        && (contractAddress?.length ? log.address === contractAddress : true)
    )
    return !!event;
  }
}