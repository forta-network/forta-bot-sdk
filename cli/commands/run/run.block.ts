import { assertExists } from '../../utils';
import { RunHandlersOnBlock } from '../../utils/run.handlers.on.block';

// runs agent handlers against specified block number/hash or multiple blocks
export type RunBlock = (blockNumberOrHash: string) => Promise<void>

export function provideRunBlock(
  runHandlersOnBlock: RunHandlersOnBlock,
): RunBlock {
  assertExists(runHandlersOnBlock, 'runHandlersOnBlock')

  return async function runBlock(blockNumberOrHash: string) {
    let blocks = [blockNumberOrHash]
    // support for specifying multiple blocks with comma-delimited list
    if (blockNumberOrHash.includes(",")) {
      blocks = blockNumberOrHash.split(",")
    }

    for (const block of blocks) {
      await runHandlersOnBlock(block)
    }
    
  }
}