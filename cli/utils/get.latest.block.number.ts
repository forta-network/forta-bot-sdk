import { assertExists } from ".";
import { WithRetry } from "./with.retry";

// returns the latest block number as reported by the "eth_blockNumber" json-rpc method
export type GetLatestBlockNumber = () => Promise<number>;

export default function provideGetLatestBlockNumber(
  withRetry: WithRetry,
  ethersProviderSend: (method: string, params: any[]) => Promise<any>
) {
  assertExists(withRetry, "withRetry");
  assertExists(ethersProviderSend, "ethersProviderSend");

  return async function getLatestBlockNumber() {
    const blockNumberHex: string = await withRetry(ethersProviderSend, [
      "eth_blockNumber",
      [],
    ]);
    return parseInt(blockNumberHex);
  };
}
