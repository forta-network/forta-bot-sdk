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
      const { botId, alertId, alertIds: subscriptionAlertIds } = subscription;
      botIds.add(botId);
      if (alertId) {
        alertIds.add(alertId);
      }
      if (subscriptionAlertIds) {
        for (const alertId of subscriptionAlertIds) {
          alertIds.add(alertId);
        }
      }
    }

    const subscriptionAlerts: Alert[] = [];
    let query: AlertQueryOptions;
    let response: AlertsResponse | undefined;
    const now = new Date();
    do {
      query = {
        botIds: Array.from(botIds),
        createdSince: now.getTime() - createdSince.getTime(),
        first: 100,
        startingCursor: response?.pageInfo.endCursor,
      };
      if (alertIds.size > 0) {
        query.alertIds = Array.from(alertIds);
      }
      response = await getAlerts(query);
      subscriptionAlerts.push(...response.alerts);
    } while (response.pageInfo?.hasNextPage);

    return subscriptionAlerts;
  };
}
