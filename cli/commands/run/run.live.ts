import { providers } from "ethers"
import { assertExists } from '../../utils';
import { RunHandlersOnBlock } from '../../utils/run.handlers.on.block';

// runs agent handlers against live blockchain data
export type RunLive = () => Promise<void>

export function provideRunLive(
  ethersProvider: providers.JsonRpcProvider, 
  runHandlersOnBlock: RunHandlersOnBlock,
  setInterval: (callback: any, ms: number) => NodeJS.Timeout
): RunLive {
  assertExists(ethersProvider, 'ethersProvider')
  assertExists(runHandlersOnBlock, 'runHandlersOnBlock')
  assertExists(setInterval, 'setInterval')

  return async function runLive() {
    console.log('listening for blockchain data...')

    // process the latest block
    let latestBlockNumber = await ethersProvider.getBlockNumber()
    await runHandlersOnBlock(latestBlockNumber)

    let isProcessing = false

    // poll for the latest block every 15s and process each
    setInterval(async () => {
      // if a previous iteration is running, just update the latestBlockNumber so it will get processed
      if (isProcessing) {
        latestBlockNumber = await ethersProvider.getBlockNumber()
        return
      }

      isProcessing = true
      let currBlockNumber = latestBlockNumber
      latestBlockNumber = await ethersProvider.getBlockNumber()
      while (currBlockNumber < latestBlockNumber) {
        currBlockNumber++
        await runHandlersOnBlock(currBlockNumber)
      }
      isProcessing = false
    }, 15000)
  }
}