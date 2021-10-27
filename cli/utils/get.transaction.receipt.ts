import { providers } from "ethers";
import { assertExists } from ".";

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