import { EventType, Network } from "./index"
import { Log, Receipt } from "./receipt"
import { Trace } from "./trace"
import { Transaction } from "./transaction"
import { keccak256 } from "./utils"
import { ethers } from '.'
import _ from "lodash"

export interface TxEventBlock {
  hash: string;
  number: number;
  timestamp: number;
}

// used for decoded logs, simply including the originating address of the log
export type LogDescription = ethers.utils.LogDescription & {
    address: string
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

  filterLog(eventAbi: string | string[], contractAddress: string = ''): LogDescription[] {
    eventAbi = _.isArray(eventAbi) ? eventAbi : [eventAbi]
    let logs = this.receipt.logs
    // filter logs by contract address, if provided
    if (contractAddress) {
      contractAddress = contractAddress.toLowerCase()
      logs = logs.filter(log => log.address.toLowerCase() === contractAddress)
    }
    // parse logs
    const results: LogDescription[] = []
    const iface = new ethers.utils.Interface(eventAbi);
    for (const log of logs) {
      try {
        const parsedLog = iface.parseLog(log)
        results.push(Object.assign(parsedLog, { address: log.address }))
      } catch (e) {}// TODO see if theres a better way to handle 'no matching event' error
    }
    return results
  }

  filterFunction(functionAbi: string | string[], contractAddress: string = ''): ethers.utils.TransactionDescription[] {
    functionAbi = _.isArray(functionAbi) ? functionAbi : [functionAbi]
    // determine where to look for function calls (i.e. transaction object or traces)
    let sources: {data: string, value: string, to?: string | null}[] = [this.transaction]
    if (this.traces.length) {
      sources = this.traces.map(({action}) => ({ data: action.input, value: action.value, to: action.to }))
    }
    // filter by contract address, if provided
    if (contractAddress) {
      contractAddress = contractAddress.toLowerCase()
      sources = sources.filter(source => source.to?.toLowerCase() === contractAddress)
    }
    // parse function inputs
    const results: ethers.utils.TransactionDescription[] = []
    const iface = new ethers.utils.Interface(functionAbi)
    for (const source of sources) {
      try {
        results.push(iface.parseTransaction(source))
      } catch (e) {}// TODO see if theres a better way to handle 'no matching function' error
    }
    return results
  }
}