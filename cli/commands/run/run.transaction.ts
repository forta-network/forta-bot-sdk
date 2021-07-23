import Web3 from "web3";
import { HandleTransaction } from "../../../sdk";
import { assertExists } from '../../utils';
import { GetAgentHandlers } from "../../utils/get.agent.handlers";
import { RunTransactionHandlersOnTransaction } from "../../utils/run.transaction.handlers.on.transaction";

// runs agent transaction handlers against a specified transaction
export type RunTransaction = (txHash: string) => Promise<void>

export function provideRunTransaction(
  web3: Web3,
  getAgentHandlers: GetAgentHandlers,
  runTransactionHandlersOnTransaction: RunTransactionHandlersOnTransaction
): RunTransaction {
  assertExists(web3, 'web3')
  assertExists(getAgentHandlers, 'getAgentHandlers')
  assertExists(runTransactionHandlersOnTransaction, 'runTransactionHandlersOnTransaction')

  return async function runTransaction(txHash: string) {
    const { transactionHandlers } = await getAgentHandlers()
    if (!transactionHandlers.length) {
      throw new Error("no transaction handlers found")
    }

    await runTransactionHandlersOnTransaction(transactionHandlers, txHash)
  }
}