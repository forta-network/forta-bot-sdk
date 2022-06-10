import { AxiosStatic } from "axios";
import { assertExists } from "..";
import { StateChangeContractEvent } from "../../contracts/agent.registry";


export interface EventFilter{
    type: StateChangeContractEvent
    topic_0: string
}

export interface PolyscanLog{
    topics: string[],
    timeStamp: number,
    transactionHash: string
}

export type GetLogsFromPolyscan = (address: string, eventFilter: EventFilter, agentId: string) => Promise<any>


export default function provideGetLogsFromPolyscan(
    axios: AxiosStatic,
    polyscanApiUrl: string,
): GetLogsFromPolyscan {

    assertExists(axios,'axios')

    return async function getLogsFromPolyscan(address: string, eventFilter: EventFilter, agentId: string) {

        const agentIdFilterParams = eventFilter.type !== "Transfer" ? 
            {
                topic1: agentId,
                topic0_1_opr: "and"
            } :
            {
                topic3: agentId,
                topic0_3_opr: "and"
            }


        const response = await axios.get(polyscanApiUrl, {
            headers: {
              "accept": "application/json",
            },
            params: {
              apikey: "UYNC8TFCFJ9HJVMMY9Z6X4DVW2W5K1NII2",
              module: "logs",
              action: "getLogs",
              address,
              topic0: eventFilter.topic_0,
              ...agentIdFilterParams
            }
          });

          const {data} = response

          if(typeof data.result === 'string') {
              throw Error(`Failed to call polyscan api: ${data.result}`)
          }
          const hasData = data && data.result && data.result.length > 0;
          return hasData ? data.result : []
    }
}