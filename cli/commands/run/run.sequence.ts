import { assertExists } from "../../utils";
import { RunHandlersOnAlert } from "../../utils/run.handlers.on.alert";
import { RunHandlersOnBlock } from "../../utils/run.handlers.on.block";
import { RunHandlersOnTransaction } from "../../utils/run.handlers.on.transaction";

// runs agent handlers against a sequence of blocks/transactions/alerts
export type RunSequence = (sequence: string) => Promise<void>;

export function provideRunSequence(
  runHandlersOnBlock: RunHandlersOnBlock,
  runHandlersOnTransaction: RunHandlersOnTransaction,
  runHandlersOnAlert: RunHandlersOnAlert
): RunSequence {
  assertExists(runHandlersOnBlock, "runHandlerOnBlock");
  assertExists(runHandlersOnTransaction, "runHandlerOnTransaction");
  assertExists(runHandlersOnAlert, "runHandlerOnAlert");

  return async function runSequence(sequence: string) {
    if (!sequence.includes(",")) {
      throw new Error("sequence must be a comma-delimited list of strings");
    }

    const steps = sequence.split(",");
    for (const step of steps) {
      if (step.startsWith("tx")) {
        // transaction step
        await runHandlersOnTransaction(step.substring(2));
      } else if (step.startsWith("0x")) {
        // alert step
        await runHandlersOnAlert(step);
      } else {
        // block step
        await runHandlersOnBlock(parseInt(step));
      }
    }
  };
}
