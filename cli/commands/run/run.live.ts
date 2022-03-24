import { providers } from "ethers";
import { assertExists } from "../../utils";
import { RunHandlersOnBlock } from "../../utils/run.handlers.on.block";

// runs agent handlers against live blockchain data
export type RunLive = (shouldContinuePolling?: Function) => Promise<void>;

export function provideRunLive(
  ethersProvider: providers.JsonRpcProvider,
  runHandlersOnBlock: RunHandlersOnBlock,
  sleep: (durationMs: number) => Promise<void>
): RunLive {
  assertExists(ethersProvider, "ethersProvider");
  assertExists(runHandlersOnBlock, "runHandlersOnBlock");
  assertExists(sleep, "sleep");

  return async function runLive(shouldContinuePolling: Function = () => true) {
    console.log("listening for blockchain data...");
    let currBlockNumber;

    // poll for latest blocks
    while (shouldContinuePolling()) {
      const latestBlockNumber = await ethersProvider.getBlockNumber();
      if (currBlockNumber == undefined) {
        currBlockNumber = latestBlockNumber;
      }

      // if no new blocks
      if (currBlockNumber > latestBlockNumber) {
        // wait for a bit
        await sleep(15000);
      } else {
        // process new blocks
        while (currBlockNumber <= latestBlockNumber) {
          await runHandlersOnBlock(currBlockNumber);
          currBlockNumber++;
        }
      }
    }
  };
}
