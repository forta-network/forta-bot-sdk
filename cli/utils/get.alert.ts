import { Alert } from "../../sdk";
import { Cache } from "flat-cache";
import { assertExists } from ".";
import { GetAlerts } from "../../sdk";

// used by runHandlersOnAlert to fetch a specific alert and process it
export type GetAlert = (alertHash: string) => Promise<Alert>;

export const ONE_DAY_IN_MS = 86400000;
export const LOOKBACK_PERIOD_DAYS = 90;

export default function provideGetAlert(
  getAlerts: GetAlerts,
  cache: Cache
) {
  assertExists(getAlerts, "getAlerts");
  assertExists(cache, "cache");

  return async function getAlert(alertHash: string) {
    // check cache first
    const cachedAlert = cache.getKey(getCacheKey(alertHash));
    if (cachedAlert) return Alert.fromObject(cachedAlert);

    // fetch the alert
    const endDate = new Date(); // i.e. now
    const startDate = new Date(
      endDate.getTime() - LOOKBACK_PERIOD_DAYS * ONE_DAY_IN_MS
    );
    const alertsResponse = await getAlerts({
      alertHash: alertHash,
      blockDateRange: {
        startDate,
        endDate,
      },
    });
    if (alertsResponse.alerts.length == 0) {
      throw new Error(`no alert found with hash ${alertHash}`);
    }
    const alert = alertsResponse.alerts[0];

    cache.setKey(getCacheKey(alertHash), JSON.parse(alert.toString()));
    return alert;
  };
}

export const getCacheKey = (alertHash: string) =>
  `${alertHash.toLowerCase()}-alert`;
