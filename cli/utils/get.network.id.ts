import { providers } from "ethers";
import { assertExists } from ".";

// returns the network id as reported by the "net_version" json-rpc method
export type GetNetworkId = () => Promise<number>

export default function provideGetNetworkId(
  ethersProvider: providers.JsonRpcProvider
) {
  assertExists(ethersProvider, 'ethersProvider')

  return async function provideGetNetworkId() {
    return ethersProvider.send(
      'net_version',
      []
    )
  }
}