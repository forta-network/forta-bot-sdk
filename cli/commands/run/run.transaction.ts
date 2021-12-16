import { assertExists } from '../../utils';
import { RunHandlersOnTransaction } from "../../utils/run.handlers.on.transaction";

// runs agent transaction handlers against a specified transaction or transactions
export type RunTransaction = (txHash: string) => Promise<void>

export function provideRunTransaction(
  runHandlersOnTransaction: RunHandlersOnTransaction
): RunTransaction {
  assertExists(runHandlersOnTransaction, 'runHandlersOnTransaction')

  return async function runTransaction(txHash: string) {
    let hashes = [txHash]
    // support for specifying multiple transactions with comma-delimited list
    if (txHash.includes(",")) {
      hashes = txHash.split(",")
    }

    for (const hash of hashes) {
      await runHandlersOnTransaction(hash)
    }
  }
}