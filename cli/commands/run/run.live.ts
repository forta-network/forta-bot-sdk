import { providers } from "ethers";
import { BotSubscription } from "../../../sdk";
import { assertExists, getBlockChainNetworkConfig } from "../../utils";
import { GetAgentHandlers } from "../../utils/get.agent.handlers";
import { GetSubscriptionAlerts } from "../../utils/get.subscription.alerts";
import { RunHandlersOnAlert } from "../../utils/run.handlers.on.alert";
import { RunHandlersOnBlock } from "../../utils/run.handlers.on.block";

// runs agent handlers against live blockchain data
export type RunLive = (shouldContinuePolling?: Function) => Promise<void>;

export function provideRunLive(
  getAgentHandlers: GetAgentHandlers,
  getSubscriptionAlerts: GetSubscriptionAlerts,
  ethersProvider: providers.JsonRpcProvider,
  runHandlersOnBlock: RunHandlersOnBlock,
  runHandlersOnAlert: RunHandlersOnAlert,
  sleep: (durationMs: number) => Promise<void>
): RunLive {
  assertExists(getAgentHandlers, "getAgentHandlers");
  assertExists(getSubscriptionAlerts, "getSubscriptionAlerts");
  assertExists(ethersProvider, "ethersProvider");
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
    const network = await ethersProvider.getNetwork();
    const { chainId } = network;
    const { blockTimeInSeconds } = getBlockChainNetworkConfig(chainId);
    let currBlockNumber;
    let lastAlertFetchTimestamp: Date | undefined = undefined;

    // poll for latest blocks
    while (shouldContinuePolling()) {
      const latestBlockNumber = await ethersProvider.getBlockNumber();
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
            await runHandlersOnBlock(currBlockNumber);
          }
          currBlockNumber++;
        }

        // process new alerts
        if (
          handleAlert &&
          (lastAlertFetchTimestamp == undefined ||
            Date.now() - lastAlertFetchTimestamp.getTime() > 60000)
        ) {
          const queryStartTime = new Date();
          console.log("querying alerts...");
          const alerts = await getSubscriptionAlerts(
            botSubscriptions,
            lastAlertFetchTimestamp || new Date(Date.now() - 60000)
          );
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
