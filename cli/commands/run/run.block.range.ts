import { assertExists } from '../../utils';
import { RunHandlersOnBlock } from '../../utils/run.handlers.on.block';

// runs agent handlers against specified block number range
export type RunBlockRange = (blockRange: string) => Promise<void>

export function provideRunBlockRange(
  runHandlersOnBlock: RunHandlersOnBlock,
): RunBlockRange {
  assertExists(runHandlersOnBlock, 'runHandlersOnBlock')

  return async function runBlockRange(blockRange: string) {
    const [startBlock, endBlock] = blockRange.split('..')
    const startBlockNumber = parseInt(startBlock)
    const endBlockNumber = parseInt(endBlock)
    if (endBlockNumber <= startBlockNumber) {
      throw new Error('end block must be greater than start block')
    }
  
    for (let blockNumber = startBlockNumber; blockNumber <= endBlockNumber; blockNumber++) {
      await runHandlersOnBlock(blockNumber)
    }
  }
}