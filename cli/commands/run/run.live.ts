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

    // poll for the latest block every 15s and process each
    setInterval(async () => {
      let currBlockNumber = latestBlockNumber
      latestBlockNumber = await ethersProvider.getBlockNumber()
      const endBlockNumber = latestBlockNumber
      while (currBlockNumber < endBlockNumber) {
        currBlockNumber++
        await runHandlersOnBlock(currBlockNumber)
      }
    }, 15000)
  }
}