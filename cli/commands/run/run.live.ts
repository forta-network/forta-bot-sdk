import Web3 from "web3";
import { assertExists } from '../../utils';
import { RunHandlersOnBlock } from '../../utils/run.handlers.on.block';

// runs agent handlers against live blockchain data
export type RunLive = () => Promise<void>

export function provideRunLive(
  jsonRpcUrl: string,
  web3: Web3, 
  runHandlersOnBlock: RunHandlersOnBlock,
): RunLive {
  assertExists(jsonRpcUrl, 'jsonRpcUrl')
  assertExists(web3, 'web3')
  assertExists(runHandlersOnBlock, 'runHandlersOnBlock')

  return async function runLive() {
    if (!jsonRpcUrl.startsWith('ws')) {
      throw new Error('jsonRpcUrl must begin with ws:// or wss:// to listen for blockchain data')
    }

    console.log('listening for blockchain data...')
    web3.eth.subscribe('newBlockHeaders', (error) => { if (error) console.error(error) })
      .on("data", (blockHeader) => runHandlersOnBlock(blockHeader.number))
      .on("error", console.error);
  }
}