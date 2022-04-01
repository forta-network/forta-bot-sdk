import { providers } from "ethers";
import { Cache } from "flat-cache";
import { assertExists } from ".";
import { JsonRpcLog } from "./get.transaction.receipt";

export type GetLogsForBlock = (blockNumber: number) => Promise<JsonRpcLog[]>;

export default function provideGetLogsForBlock(
  ethersProvider: providers.JsonRpcProvider,
  cache: Cache
) {
  assertExists(ethersProvider, "ethersProvider");
  assertExists(cache, "cache");

  return async function getLogsForBlock(blockNumber: number) {
    // check cache first
    const cacheKey = getCacheKey(blockNumber);
    const cachedLogs = cache.getKey(cacheKey);
    if (cachedLogs) return cachedLogs;

    // fetch logs for the block
    const blockNumberHex = `0x${blockNumber.toString(16)}`;
    const logs = await ethersProvider.send("eth_getLogs", [
      { fromBlock: blockNumberHex, toBlock: blockNumberHex },
    ]);
    cache.setKey(cacheKey, logs);
    return logs;
  };
}

export const getCacheKey = (blockNumber: number) => `${blockNumber}-logs`;
