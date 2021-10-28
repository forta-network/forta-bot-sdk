import { ethers, providers } from "ethers";
import { assertExists } from ".";
import { Block, Transaction } from "../../sdk";

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
  ethersProvider: providers.JsonRpcProvider
) {
  assertExists(ethersProvider, 'ethersProvider')

  return async function provideGetBlockWithTransactions(blockHashOrNumber: string | number) {
    let methodName = "eth_getBlockByNumber"
    if (typeof blockHashOrNumber === "string") {
      if (!blockHashOrNumber.startsWith("0x")) {
        blockHashOrNumber = parseInt(blockHashOrNumber)
      } else {
        methodName = "eth_getBlockByHash"
      }
    }
    return ethersProvider.send(
      methodName,
      [ethers.utils.hexValue(blockHashOrNumber), true]
    )
  }
}