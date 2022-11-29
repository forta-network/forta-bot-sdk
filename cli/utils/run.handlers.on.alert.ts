import { assertExists, assertFindings, CreateAlertEvent } from ".";
import { Alert, Finding } from "../../sdk";
import { GetAgentHandlers } from "./get.agent.handlers";
import { GetAlert } from "./get.alert";

export type RunHandlersOnAlert = (
  alertOrHash: string | Alert
) => Promise<Finding[]>;

export function provideRunHandlersOnAlert(
  getAgentHandlers: GetAgentHandlers,
  getAlert: GetAlert,
  createAlertEvent: CreateAlertEvent
): RunHandlersOnAlert {
  assertExists(getAgentHandlers, "getAgentHandlers");
  assertExists(getAlert, "getAlert");
  assertExists(createAlertEvent, "createAlertEvent");

  return async function runHandlersOnAlert(alertOrHash: string | Alert) {
    const { handleAlert } = await getAgentHandlers();
    if (!handleAlert) {
      throw new Error("no alert handler found");
    }

    let alert: Alert;
    // if passed in a string hash
    if (typeof alertOrHash === "string") {
      console.log(`fetching alert ${alertOrHash}...`);
      alert = await getAlert(alertOrHash);
    } else {
      // if passed in an alert
      alert = alertOrHash;
    }
    const alertEvent = createAlertEvent(alert);
    const findings = await handleAlert(alertEvent);

    assertFindings(findings);
    console.log(
      `${findings.length} findings for alert ${alert.hash} ${findings}`
    );
    return findings;
  };
}
