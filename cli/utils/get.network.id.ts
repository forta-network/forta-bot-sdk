import { assertExists } from ".";
import { WithRetry } from "./with.retry";

// returns the network/chain id as reported by the "eth_chainId" json-rpc method
export type GetNetworkId = () => Promise<number>;

export default function provideGetNetworkId(
  withRetry: WithRetry,
  ethersProviderSend: (method: string, params: any[]) => Promise<any>
) {
  assertExists(withRetry, "withRetry");
  assertExists(ethersProviderSend, "ethersProviderSend");

  return async function getNetworkId() {
    const networkId: string = await withRetry(ethersProviderSend, [
      "eth_chainId",
      [],
    ]);
    return parseInt(networkId);
  };
}
