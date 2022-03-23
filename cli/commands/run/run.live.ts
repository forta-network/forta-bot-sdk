import { providers } from "ethers";
import { assertExists } from "../../utils";
import { RunHandlersOnBlock } from "../../utils/run.handlers.on.block";

// runs agent handlers against live blockchain data
export type RunLive = () => Promise<void>;

export function provideRunLive(
  ethersProvider: providers.JsonRpcProvider,
  runHandlersOnBlock: RunHandlersOnBlock
): RunLive {
  assertExists(ethersProvider, "ethersProvider");
  assertExists(runHandlersOnBlock, "runHandlersOnBlock");

  return async function runLive() {
    console.log("listening for blockchain data...");
    let currBlockNumber;

    // poll for latest blocks
    while (true) {
      const latestBlockNumber = await ethersProvider.getBlockNumber();

      // if no new blocks
      if (latestBlockNumber == currBlockNumber) {
        // wait for a bit
        await new Promise((resolve) => setTimeout(resolve, 15000));
      } else {
        if (currBlockNumber == undefined) {
          currBlockNumber = latestBlockNumber;
        }

        // process the new blocks
        while (currBlockNumber <= latestBlockNumber) {
          await runHandlersOnBlock(currBlockNumber);
          currBlockNumber++;
        }
      }
    }
  };
}
