import { ethers, providers } from "ethers";
import { assertExists } from ".";
import { Block, Transaction } from "../../sdk";
import { Cache } from 'flat-cache'

export type JsonRpcTransaction = Omit<Transaction, 'nonce' | 'data'> & {
  nonce: string,
  input: string
}

export type JsonRpcBlock = Omit<Block, 'number' | 'timestamp' | 'transactions'> & {
  number: string,
  timestamp: string,
  transactions: JsonRpcTransaction[]
}

// returns a block as provided by the "eth_getBlockByNumber" or "eth_getBlockByHash" json-rpc method
export type GetBlockWithTransactions = (blockHashOrNumber: string | number) => Promise<JsonRpcBlock>

export default function provideGetBlockWithTransactions(
  ethersProvider: providers.JsonRpcProvider,
  cache: Cache
) {
  assertExists(ethersProvider, 'ethersProvider')
  assertExists(cache, 'cache')

  return async function getBlockWithTransactions(blockHashOrNumber: string | number) {
    // check the cache first
    const cachedBlock = cache.getKey(blockHashOrNumber.toString().toLowerCase())
    if (cachedBlock) return cachedBlock

    // determine whether to call getBlockByNumber (default) or getBlockByHash based on input
    let methodName = "eth_getBlockByNumber"
    if (typeof blockHashOrNumber === "string") {
      if (!blockHashOrNumber.startsWith("0x")) {
        blockHashOrNumber = parseInt(blockHashOrNumber)
      } else {
        methodName = "eth_getBlockByHash"
      }
    }

    // fetch the block
    const block = await ethersProvider.send(
      methodName,
      [ethers.utils.hexValue(blockHashOrNumber), true]
    )
    cache.setKey(block.hash.toLowerCase(), block)
    cache.setKey(parseInt(block.number).toString(), block)
    return block
  }
}