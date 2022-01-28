import { providers } from "ethers"
import { assertExists } from '../../utils';
import { RunHandlersOnBlock } from '../../utils/run.handlers.on.block';

// runs agent handlers against live blockchain data
export type RunLive = () => Promise<void>

export function provideRunLive(
  ethersProvider: providers.JsonRpcProvider, 
  runHandlersOnBlock: RunHandlersOnBlock,
  shouldContinue: () => boolean
): RunLive {
  assertExists(ethersProvider, 'ethersProvider')
  assertExists(runHandlersOnBlock, 'runHandlersOnBlock')
  assertExists(shouldContinue, 'shouldContinue')

  return async function runLive() {

    console.log('listening for blockchain data...')

    // generate block queue
    let latestBlockNumber = await ethersProvider.getBlockNumber()
    let blockQueue = Array(25).fill(latestBlockNumber).map((e, i) => e + i)
    blockQueue.shift()
    blockQueue.push(blockQueue[blockQueue.length - 1] + 1)

    await runHandlersOnBlock(latestBlockNumber)
    let currBlockNumber = blockQueue.shift()

    while(shouldContinue()) {
      let endBlockNumber = await ethersProvider.getBlockNumber()
      while (currBlockNumber < endBlockNumber) {
        await runHandlersOnBlock(currBlockNumber)
        currBlockNumber = blockQueue.shift()
        blockQueue.push(blockQueue[blockQueue.length - 1] + 1)
      }
    }
  }
}