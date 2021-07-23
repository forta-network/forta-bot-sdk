import Web3 from 'web3';
import { assertExists } from '../../utils';
import { RunBlockHandlers } from '../../utils/run.block.handlers';
import { RunTransactionHandlersOnBlock } from '../../utils/run.transaction.handlers.on.block';
import { GetAgentHandlers } from '../../utils/get.agent.handlers';

// runs agent handlers against specified block number range
export type RunBlockRange = (blockRange: string) => Promise<void>

export function provideRunBlockRange(
  web3: Web3,
  getAgentHandlers: GetAgentHandlers,
  runBlockHandlers: RunBlockHandlers,
  runTransactionHandlersOnBlock: RunTransactionHandlersOnBlock
): RunBlockRange {
  assertExists(web3, 'web3')
  assertExists(getAgentHandlers, 'getAgentHandlers')
  assertExists(runBlockHandlers, 'runBlockHandlers')
  assertExists(runTransactionHandlersOnBlock, 'runTransactionHandlersOnBlock')

  return async function runBlockRange(blockRange: string) {
    const [startBlock, endBlock] = blockRange.split('..')
    const startBlockNumber = parseInt(startBlock)
    const endBlockNumber = parseInt(endBlock)
    if (endBlockNumber <= startBlockNumber) {
      throw new Error('end block must be greater than start block')
    }

    const { blockHandlers, transactionHandlers } = await getAgentHandlers()
    if (!blockHandlers.length && !transactionHandlers.length) {
      throw new Error('no block/transaction handlers found')
    }
  
    for (let blockNumber = startBlockNumber; blockNumber <= endBlockNumber; blockNumber++) {
      const block = await runBlockHandlers(blockHandlers, blockNumber);
      await runTransactionHandlersOnBlock(transactionHandlers, block)
    }
  }
}