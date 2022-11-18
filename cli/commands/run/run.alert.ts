import { assertExists } from "../../utils";
import { RunHandlersOnAlert } from "../../utils/run.handlers.on.alert";

// runs agent alert handlers against a specified alert(s)
export type RunAlert = (alertHash: string) => Promise<void>;

export function provideRunAlert(
  runHandlersOnAlert: RunHandlersOnAlert
): RunAlert {
  assertExists(runHandlersOnAlert, "runHandlersOnAlert");

  return async function runAlert(alertHash: string) {
    let hashes = [alertHash];
    // support for specifying multiple alerts with comma-delimited list
    if (alertHash.includes(",")) {
      hashes = alertHash.split(",");
    }

    for (const hash of hashes) {
      await runHandlersOnAlert(hash);
    }
  };
}
