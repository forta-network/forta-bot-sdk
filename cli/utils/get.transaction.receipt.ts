import { providers } from "ethers";
import { assertExists } from ".";
import { Log, Receipt } from "../../sdk";

export type JsonRpcLog = Omit<Log, 'logIndex' | 'blockNumber' | 'transactionIndex'> & {
  logIndex: string,
  blockNumber: string,
  transactionIndex: string,
}

export type JsonRpcTransactionReceipt = Omit<Receipt, 'status' | 'blockNumber' | 'transactionIndex'| 'logs' > & {
  status: string,
  blockNumber: string,
  transactionIndex: string,
  logs: JsonRpcLog[]
}

// returns a transaction receipt as provided by the "eth_getTransactionReceipt" json-rpc method
export type GetTransactionReceipt = (txHash: string) => Promise<JsonRpcTransactionReceipt>

export default function provideGetTransactionReceipt(
  ethersProvider: providers.JsonRpcProvider
) {
  assertExists(ethersProvider, 'ethersProvider')

  return async function provideGetTransactionReceipt(txHash: string) {
    return ethersProvider.send(
      'eth_getTransactionReceipt',
      [txHash]
    )
  }
}