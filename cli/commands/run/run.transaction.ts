import { assertExists } from '../../utils';
import { RunHandlersOnTransaction } from "../../utils/run.handlers.on.transaction";

// runs agent transaction handlers against a specified transaction
export type RunTransaction = (txHash: string) => Promise<void>

export function provideRunTransaction(
  runHandlersOnTransaction: RunHandlersOnTransaction
): RunTransaction {
  assertExists(runHandlersOnTransaction, 'runHandlersOnTransaction')

  return async function runTransaction(txHash: string) {
    await runHandlersOnTransaction(txHash)
  }
}