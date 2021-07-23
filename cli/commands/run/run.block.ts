import Web3 from 'web3';
import { assertExists } from '../../utils';
import { GetAgentHandlers } from '../../utils/get.agent.handlers';
import { RunBlockHandlers } from '../../utils/run.block.handlers';
import { RunTransactionHandlersOnBlock } from '../../utils/run.transaction.handlers.on.block';

// runs agent handlers against specified block number/hash
export type RunBlock = (blockNumberOrHash: string) => Promise<void>

export function provideRunBlock(
  web3: Web3,
  getAgentHandlers: GetAgentHandlers,
  runBlockHandlers: RunBlockHandlers,
  runTransactionHandlersOnBlock: RunTransactionHandlersOnBlock
): RunBlock {
  assertExists(web3, 'web3')
  assertExists(getAgentHandlers, 'getAgentHandlers')

  return async function runBlock(blockNumberOrHash: string) {
    const { blockHandlers, transactionHandlers } = await getAgentHandlers()
    if (!blockHandlers.length && !transactionHandlers.length) {
      throw new Error("no block/transaction handlers found")
    }

    const block = await runBlockHandlers(blockHandlers, blockNumberOrHash)
    await runTransactionHandlersOnBlock(transactionHandlers, block)
  }
}