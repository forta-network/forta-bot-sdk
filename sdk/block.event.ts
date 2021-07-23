import { EventType, Network } from "./index";

export class BlockEvent {
  constructor(
    readonly type: EventType,
    readonly network: Network,
    readonly blockHash: string,
    readonly blockNumber: number
  ) {}
}