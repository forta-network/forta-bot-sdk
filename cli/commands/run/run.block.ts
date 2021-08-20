import { assertExists } from '../../utils';
import { RunHandlersOnBlock } from '../../utils/run.handlers.on.block';

// runs agent handlers against specified block number/hash
export type RunBlock = (blockNumberOrHash: string) => Promise<void>

export function provideRunBlock(
  runHandlersOnBlock: RunHandlersOnBlock,
): RunBlock {
  assertExists(runHandlersOnBlock, 'runHandlersOnBlock')

  return async function runBlock(blockNumberOrHash: string) {
    await runHandlersOnBlock(blockNumberOrHash)
  }
}