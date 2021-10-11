import { Block } from "./block";
import { EventType, Network } from "./index";

export class BlockEvent {
  constructor(
    readonly type: EventType,
    readonly network: Network,
    readonly block: Block
  ) {}

  get blockHash() {
    return this.block.hash
  }

  get blockNumber() {
    return this.block.number
  }
}