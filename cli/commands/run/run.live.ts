import Web3 from "web3";
import { assertExists } from '../../utils';
import { RunHandlersOnBlock } from '../../utils/run.handlers.on.block';

// runs agent handlers against live blockchain data
export type RunLive = () => Promise<void>

export function provideRunLive(
  web3: Web3, 
  runHandlersOnBlock: RunHandlersOnBlock,
  setInterval: (callback: any, ms: number) => NodeJS.Timeout
): RunLive {
  assertExists(web3, 'web3')
  assertExists(runHandlersOnBlock, 'runHandlersOnBlock')
  assertExists(setInterval, 'setInterval')

  return async function runLive() {
    console.log('listening for blockchain data...')

    // process the latest block
    let latestBlockNumber = await web3.eth.getBlockNumber()
    await runHandlersOnBlock(latestBlockNumber)

    // poll for the latest block every 15s and process each
    setInterval(async () => {
      let currBlockNumber = latestBlockNumber
      latestBlockNumber = await web3.eth.getBlockNumber()
      while (currBlockNumber < latestBlockNumber) {
        currBlockNumber++
        await runHandlersOnBlock(currBlockNumber)
      }
    }, 15000)
  }
}