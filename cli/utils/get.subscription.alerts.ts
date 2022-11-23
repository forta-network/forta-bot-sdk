import { assertExists } from ".";
import { Alert } from "../../sdk";
import { AlertQueryOptions, AlertsResponse } from "../../sdk/graphql/forta";
import { BotSubscription } from "../../sdk/initialize.response";

// used by runLive to fetch alerts based on a bot's subscriptions
export type GetSubscriptionAlerts = (
  subscriptions: BotSubscription[],
  createdSince: Date
) => Promise<Alert[]>;

export function provideGetSubscriptionAlerts(
  getAlerts: (q: AlertQueryOptions) => Promise<AlertsResponse>
): GetSubscriptionAlerts {
  assertExists(getAlerts, "getAlerts");

  return async function getSubscriptionAlerts(
    subscriptions: BotSubscription[],
    createdSince: Date
  ): Promise<Alert[]> {
    if (subscriptions.length == 0) return [];

    const botIds = new Set<string>();
    const alertIds = new Set<string>();
    for (const subscription of subscriptions) {
      const { botId, alertId } = subscription;
      botIds.add(botId);
      alertIds.add(alertId);
    }

    const subscriptionAlerts: Alert[] = [];
    let response: AlertsResponse | undefined;
    do {
      response = await getAlerts({
        botIds: Array.from(botIds),
        alertIds: Array.from(alertIds),
        createdSince: createdSince.getTime(),
        startingCursor: response?.pageInfo.endCursor,
      });
      subscriptionAlerts.push(...response.alerts);
    } while (response.pageInfo?.hasNextPage);

    return subscriptionAlerts;
  };
}
