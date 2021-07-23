import Web3 from "web3";
import { assertExists } from '../../utils';
import { RunBlockHandlers } from '../../utils/run.block.handlers';
import { RunTransactionHandlersOnBlock } from '../../utils/run.transaction.handlers.on.block';
import { GetAgentHandlers } from "../../utils/get.agent.handlers";

// runs agent handlers against live blockchain data
export type RunLive = () => Promise<void>

export function provideRunLive(
  jsonRpcUrl: string,
  web3: Web3, 
  getAgentHandlers: GetAgentHandlers,
  runBlockHandlers: RunBlockHandlers,
  runTransactionHandlersOnBlock: RunTransactionHandlersOnBlock
): RunLive {
  assertExists(jsonRpcUrl, 'jsonRpcUrl')
  assertExists(web3, 'web3')
  assertExists(getAgentHandlers, 'getAgentHandlers')
  assertExists(runBlockHandlers, 'runBlockHandlers')
  assertExists(runTransactionHandlersOnBlock, 'runTransactionHandlersOnBlock')

  return async function runLive() {
    if (!jsonRpcUrl.startsWith('ws')) {
      throw new Error('jsonRpcUrl must begin with ws:// or wss:// to listen for blockchain data')
    }

    const { blockHandlers, transactionHandlers } = await getAgentHandlers()
    if (!blockHandlers.length && !transactionHandlers.length) {
      throw new Error("no block/transaction handlers found")
    }
  
    console.log('listening for blockchain data...')
    web3.eth.subscribe('newBlockHeaders', (error) => {
      if (error) {
        console.error(error);
      }
    })
    .on("data", async (blockHeader) => {
      const block = await runBlockHandlers(blockHandlers, blockHeader.hash)
      await runTransactionHandlersOnBlock(transactionHandlers, block)
    })
    .on("error", console.error);
  }
}