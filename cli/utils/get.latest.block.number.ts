import { providers } from "ethers";
import { assertExists } from ".";
import { WithRetry } from "./with.retry";

// returns the latest block number as reported by the "eth_blockNumber" json-rpc method
export type GetLatestBlockNumber = () => Promise<number>;

export default function provideGetLatestBlockNumber(
  withRetry: WithRetry,
  ethersProvider: providers.JsonRpcProvider
) {
  assertExists(withRetry, "withRetry");
  assertExists(ethersProvider, "ethersProvider");

  return async function getLatestBlockNumber() {
    const blockNumberHex: string = await withRetry(
      ethersProvider.send.bind(ethersProvider), // need to bind() so that "this" is defined
      ["eth_blockNumber", []]
    );
    return parseInt(blockNumberHex);
  };
}
