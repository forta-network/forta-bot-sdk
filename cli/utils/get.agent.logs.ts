import { AxiosStatic } from "axios";
import { assertExists } from ".";

export type GetAgentLogs = (agentId: string, minute: Date) => Promise<any[]>

export function provideGetAgentLogs(
  axios: AxiosStatic,
  fortaApiUrl: string,
): GetAgentLogs {
  assertExists(axios, 'axios')

  return async function getAgentLogs(agentId: string, minute: Date) {
   
    if( !fortaApiUrl?.length) return [];

    try {
      const { data } = await axios.get(`${fortaApiUrl}/logs/agents/${agentId}`, {
        headers: {
          "accept": "application/json",
        },
        params: {
          minute: minute.toISOString()
        }
      });

      if (data?.error) throw new Error(data.error.message);

      return data;
    } catch(err) {
      console.log(`Error retrieving agent because ${err}`)
    }
  }
}