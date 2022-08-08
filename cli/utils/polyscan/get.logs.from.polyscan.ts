import { AxiosStatic } from "axios";
import { assertExists } from "..";
import { StateChangeContractEvent } from "../../contracts/agent.registry";
import retry from "async-retry";


export interface EventFilter{
    type: StateChangeContractEvent
    topicHash: string
}

export interface PolyscanLog{
    topics: string[],
    timeStamp: number,
    transactionHash: string
}

export type GetLogsFromPolyscan = (address: string, eventFilter: EventFilter, botId: string) => Promise<any>


export default function provideGetLogsFromPolyscan(
    axios: AxiosStatic,
    polyscanApiUrl: string,
): GetLogsFromPolyscan {

    assertExists(axios,'axios')

    return async function getLogsFromPolyscan(address: string, eventFilter: EventFilter, botId: string) {

        const botIdFilterParams = eventFilter.type !== "Transfer" ? 
            {
                topic1: botId,
                topic0_1_opr: "and"
            } :
            {
                topic3: botId,
                topic0_3_opr: "and"
            }
        let logData: PolyscanLog[] = []

        const apiKey = getApiKey()

        await retry(async ()=> {
            const response = await axios.get(polyscanApiUrl, {
                headers: {
                  "accept": "application/json",
                },
                params: {
                  apikey: apiKey,
                  module: "logs",
                  action: "getLogs",
                  address,
                  topic0: eventFilter.topicHash,
                  ...botIdFilterParams
                }
            });
    
              const {data} = response;
    
              const hasData = data && data.result && data.result.length > 0;
    
              if(typeof data.result === 'string') {
                  throw Error(`Failed to call polyscan api: ${data.result}`)
              }
    
              logData = hasData ? data.result : []
        }, { retries: 3})

        return logData
    }
}

// Randomly selects an api key to use for polyscan. Each api key allows us 5 req/sec
const getApiKey = (): string => {
    return (Math.floor(Math.random() * 10) % 2) === 0 ? "UYNC8TFCFJ9HJVMMY9Z6X4DVW2W5K1NII2" : "GVEAVC3WQYH9JH26MHD7THVQRQ5U5SP9R8"
}