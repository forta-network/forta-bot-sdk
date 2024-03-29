import { assertExists } from ".";
import {
  Alert,
  AlertQueryOptions,
  AlertsResponse,
  BotSubscription,
  GetAlerts,
} from "../../sdk";

// used by runLive to fetch alerts based on a bot's subscriptions
export type GetSubscriptionAlerts = (
  subscriptions: BotSubscription[]
) => Promise<Alert[]>;

export const TEN_MINUTES_IN_MS = 600000;

export function provideGetSubscriptionAlerts(
  getAlerts: GetAlerts
): GetSubscriptionAlerts {
  assertExists(getAlerts, "getAlerts");
  // maintain an in-memory map to keep track of alert's that have been seen (used for de-duping)
  const seenAlerts = new Map<string, boolean>();

  return async function getSubscriptionAlerts(
    subscriptions: BotSubscription[]
  ): Promise<Alert[]> {
    if (subscriptions.length == 0) return [];

    // run a query for each subscription (this keeps response payloads small to avoid API Gateway 10MB limit)
    const queries: Promise<Alert[]>[] = [];
    for (const subscription of subscriptions) {
      queries.push(runQuery(subscription, getAlerts));
    }
    const alertArrays = await Promise.all(queries);

    // flatten and de-dupe the responses
    const alerts: Alert[] = [];
    for (const alertArray of alertArrays) {
      for (const alert of alertArray) {
        if (seenAlerts.has(alert.hash!)) continue; // skip alerts we have already processed
        alerts.push(alert);
        seenAlerts.set(alert.hash!, true);
      }
    }
    return alerts;
  };
}

async function runQuery(
  subscription: BotSubscription,
  getAlerts: GetAlerts
): Promise<Alert[]> {
  const alerts: Alert[] = [];
  let query: AlertQueryOptions;
  let response: AlertsResponse | undefined;
  let pageSize = 1000;
  let shouldRetryFromError = false;

  do {
    try {
      const { chainId, botId, alertId, alertIds } = subscription;
      query = {
        botIds: [botId],
        createdSince: TEN_MINUTES_IN_MS,
        first: pageSize,
        startingCursor: response?.pageInfo.endCursor,
      };
      if (chainId) {
        query.chainId = chainId;
      }
      if (alertId) {
        query.alertIds = [alertId];
      }
      if (alertIds?.length) {
        if (query.alertIds?.length) {
          query.alertIds.push(...alertIds);
        } else {
          query.alertIds = alertIds;
        }
      }
      response = await getAlerts(query);
      shouldRetryFromError = false;
      alerts.push(...response.alerts);
    } catch (e) {
      // if alerts API returned 500, its likely due to response size being over 10MB AWS gateway limit
      if (e.response?.status === 500) {
        // reduce the page size in order to reduce the response size and try again
        pageSize = Math.floor(pageSize / 2);
        shouldRetryFromError = pageSize > 1;
      } else {
        throw e;
      }
    }
  } while (shouldRetryFromError || response?.pageInfo?.hasNextPage);

  return alerts;
}
