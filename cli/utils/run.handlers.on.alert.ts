import { assertExists, assertFindings, CreateAlertEvent } from ".";
import { Finding } from "../../sdk";
import { GetAgentHandlers } from "./get.agent.handlers";
import { GetAlert } from "./get.alert";

export type RunHandlersOnAlert = (alertHash: string) => Promise<Finding[]>;

export function provideRunHandlersOnAlert(
  getAgentHandlers: GetAgentHandlers,
  getAlert: GetAlert,
  createAlertEvent: CreateAlertEvent
): RunHandlersOnAlert {
  assertExists(getAgentHandlers, "getAgentHandlers");
  assertExists(getAlert, "getAlert");
  assertExists(createAlertEvent, "createAlertEvent");

  return async function runHandlersOnAlert(alertHash: string) {
    const { handleAlert } = await getAgentHandlers();
    if (!handleAlert) {
      throw new Error("no alert handler found");
    }

    console.log(`fetching alert ${alertHash}...`)
    const alert = await getAlert(alertHash);
    const alertEvent = createAlertEvent(alert);
    const findings = await handleAlert(alertEvent);

    assertFindings(findings);
    console.log(
      `${findings.length} findings for alert ${alertHash} ${findings}`
    );
    return findings;
  };
}
