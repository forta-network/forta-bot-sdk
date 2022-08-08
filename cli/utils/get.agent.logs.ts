import { AxiosStatic } from "axios";
import { assertExists, assertIsNonEmptyString } from ".";

export type GetAgentLogs = (botId: string, minute?: Date) => Promise<FortaAgentLogResponse[]>

export function provideGetAgentLogs(
  axios: AxiosStatic,
  fortaApiUrl: string,
): GetAgentLogs {
  assertExists(axios, 'axios')
  assertIsNonEmptyString(fortaApiUrl, 'fortaApiUrl')

  return async function getAgentLogs(botId: string, minute?: Date) {
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

export interface FortaAgentLogResponse {
  scanner: string;
  timestamp: string;
  logs: string;
}