import { providers } from "ethers";
import { Cache } from "flat-cache";
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
  ethersProvider: providers.JsonRpcProvider,
  cache: Cache
) {
  assertExists(ethersProvider, 'ethersProvider')
  assertExists(cache, 'cache')

  return async function getTransactionReceipt(txHash: string) {
    // check cache first
    const cachedReceipt = cache.getKey(txHash.toLowerCase())
    if (cachedReceipt) return cachedReceipt

    // fetch the receipt
    const receipt = await ethersProvider.send(
      'eth_getTransactionReceipt',
      [txHash]
    )
    cache.setKey(txHash.toLowerCase(), receipt)
    return receipt
  }
}