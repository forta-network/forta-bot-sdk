import { BotSubscription } from "../../../sdk";
import { assertExists, getBlockChainNetworkConfig } from "../../utils";
import { GetAgentHandlers } from "../../utils/get.agent.handlers";
import { GetSubscriptionAlerts } from "../../utils/get.subscription.alerts";
import { RunHandlersOnAlert } from "../../utils/run.handlers.on.alert";
import { RunHandlersOnBlock } from "../../utils/run.handlers.on.block";
import { GetNetworkId } from "../../utils/get.network.id";
import { GetLatestBlockNumber } from "../../utils/get.latest.block.number";

// runs agent handlers against live blockchain data
export type RunLive = (shouldContinuePolling?: Function) => Promise<void>;

const ONE_MIN_IN_MS = 60000

export function provideRunLive(
  getAgentHandlers: GetAgentHandlers,
  getSubscriptionAlerts: GetSubscriptionAlerts,
  getNetworkId: GetNetworkId,
  getLatestBlockNumber: GetLatestBlockNumber,
  runHandlersOnBlock: RunHandlersOnBlock,
  runHandlersOnAlert: RunHandlersOnAlert,
  sleep: (durationMs: number) => Promise<void>
): RunLive {
  assertExists(getAgentHandlers, "getAgentHandlers");
  assertExists(getSubscriptionAlerts, "getSubscriptionAlerts");
  assertExists(getNetworkId, "getNetworkId");
  assertExists(getLatestBlockNumber, "getLatestBlockNumber");
  assertExists(runHandlersOnBlock, "runHandlersOnBlock");
  assertExists(runHandlersOnAlert, "runHandlersOnAlert");
  assertExists(sleep, "sleep");

  return async function runLive(shouldContinuePolling: Function = () => true) {
    const { handleBlock, handleTransaction, handleAlert, initializeResponse } =
      await getAgentHandlers();
    if (!handleBlock && !handleTransaction && !handleAlert) {
      throw new Error("no block/transaction/alert handler found");
    }

    let botSubscriptions: BotSubscription[] = [];
    if (initializeResponse?.alertConfig) {
      botSubscriptions = initializeResponse.alertConfig.subscriptions;
    }

    console.log("listening for blockchain data...");
    const networkId = await getNetworkId();
    const { blockTimeInSeconds } = getBlockChainNetworkConfig(networkId);
    let currBlockNumber;
    let lastAlertFetchTimestamp: Date | undefined = undefined;

    // poll for latest blocks
    while (shouldContinuePolling()) {
      const latestBlockNumber = await getLatestBlockNumber();
      if (currBlockNumber == undefined) {
        currBlockNumber = latestBlockNumber;
      }

      // if no new blocks
      if (currBlockNumber > latestBlockNumber) {
        // wait for a bit
        await sleep(blockTimeInSeconds * 1000);
      } else {
        // process new blocks
        while (currBlockNumber <= latestBlockNumber) {
          if (handleBlock || handleTransaction) {
            await runHandlersOnBlock(currBlockNumber, networkId);
          }
          currBlockNumber++;
        }

        // process new alerts
        if (
          handleAlert &&
          (lastAlertFetchTimestamp == undefined ||
            Date.now() - lastAlertFetchTimestamp.getTime() > ONE_MIN_IN_MS)
        ) {
          const queryStartTime = new Date();
          console.log("querying alerts...");
          const alerts = await getSubscriptionAlerts(botSubscriptions);
          console.log(`found ${alerts.length} alerts`);
          lastAlertFetchTimestamp = queryStartTime;
          for (const alert of alerts) {
            await runHandlersOnAlert(alert);
          }
        }
      }
    }
  };
}
