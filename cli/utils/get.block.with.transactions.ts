import { ethers, providers } from "ethers";
import { assertExists } from ".";

export default function provideGetBlockWithTransactions(
  ethersProvider: providers.JsonRpcProvider
) {
  assertExists(ethersProvider, 'ethersProvider')

  return async function provideGetBlockWithTransactions(blockHashOrNumber: string | number) {
    return ethersProvider.send(
      'eth_getBlockByNumber',
      [ethers.utils.hexValue(blockHashOrNumber), true]
    )
  }
}