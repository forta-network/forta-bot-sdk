import { assertExists } from ".";
import { Alert, AlertQueryOptions, AlertsResponse, BotSubscription, GetAlerts } from "../../sdk";

// used by runLive to fetch alerts based on a bot's subscriptions
export type GetSubscriptionAlerts = (
  subscriptions: BotSubscription[],
  createdSince: Date
) => Promise<Alert[]>;

export function provideGetSubscriptionAlerts(
  getAlerts: GetAlerts
): GetSubscriptionAlerts {
  assertExists(getAlerts, "getAlerts");

  return async function getSubscriptionAlerts(
    subscriptions: BotSubscription[],
    createdSince: Date
  ): Promise<Alert[]> {
    if (subscriptions.length == 0) return [];

    // group the alert queries by chain id
    const chainIdQueries = new Map<
      number,
      { botIds: Set<string>; alertIds: Set<string> }
    >();
    for (const subscription of subscriptions) {
      if (subscription.chainId == undefined) {
        subscription.chainId = 0; // group subscriptions with no chain id into one
      }
      appendToChainIdQuery(chainIdQueries, subscription);
    }

    // run all the queries in parallel
    const queries: Promise<Alert[]>[] = [];
    for (const chainId of Array.from(chainIdQueries.keys())) {
      queries.push(
        runQuery(chainId, chainIdQueries.get(chainId)!, createdSince, getAlerts)
      );
    }
    const alertArrays = await Promise.all(queries);

    // flatten the responses
    const alerts: Alert[] = [];
    for (const array of alertArrays) {
      alerts.push(...array);
    }
    return alerts;
  };
}

async function runQuery(
  chainId: number,
  { botIds, alertIds }: { botIds: Set<string>; alertIds: Set<string> },
  createdSince: Date,
  getAlerts: GetAlerts
): Promise<Alert[]> {
  const alerts: Alert[] = [];
  let query: AlertQueryOptions;
  let response: AlertsResponse | undefined;
  const now = new Date();

  do {
    query = {
      botIds: Array.from(botIds),
      createdSince: now.getTime() - createdSince.getTime(),
      first: 1000,
      startingCursor: response?.pageInfo.endCursor,
    };
    if (chainId > 0) {
      query.chainId = chainId;
    }
    if (alertIds.size > 0) {
      query.alertIds = Array.from(alertIds);
    }
    response = await getAlerts(query);
    alerts.push(...response.alerts);
  } while (response.pageInfo?.hasNextPage);

  return alerts;
}

function appendToChainIdQuery(
  chainIdQueries: Map<number, { botIds: Set<string>; alertIds: Set<string> }>,
  subscription: BotSubscription
) {
  const chainId = subscription.chainId!;
  if (!chainIdQueries.has(chainId)) {
    chainIdQueries.set(chainId, {
      botIds: new Set<string>(),
      alertIds: new Set<string>(),
    });
  }

  const { botId, alertId, alertIds } = subscription;
  const chainIdQuery = chainIdQueries.get(chainId)!;
  chainIdQuery.botIds.add(botId);
  if (alertId) {
    chainIdQuery.alertIds.add(alertId);
  }
  if (alertIds) {
    for (const alertId of alertIds) {
      chainIdQuery.alertIds.add(alertId);
    }
  }
}
