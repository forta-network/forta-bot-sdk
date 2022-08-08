import { AxiosStatic } from "axios";
import { assertExists, assertIsNonEmptyString } from ".";

export type GetBotLogs = (botId: string, minute?: Date) => Promise<FortaBotLogResponse[]>

export function provideGetBotLogs(
  axios: AxiosStatic,
  fortaApiUrl: string,
): GetBotLogs {
  assertExists(axios, 'axios')
  assertIsNonEmptyString(fortaApiUrl, 'fortaApiUrl')

  return async function getBotLogs(botId: string, minute?: Date) {
    const { data } = await axios.get(`${fortaApiUrl}/logs/agents/${botId}`, {
      headers: {
        "accept": "application/json",
      },
      params: {
        ...(minute ? {minute: minute.toISOString()} : {})
      }
    });

    if (data?.error) throw new Error(data.error.message);

    return data;
  }
}

export interface FortaBotLogResponse {
  scanner: string;
  timestamp: string;
  logs: string;
}