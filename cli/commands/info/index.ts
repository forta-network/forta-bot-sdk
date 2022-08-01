import { CommandHandler } from "../..";
import AgentRegistry, 
{ AGENT_REGISTRY_EVENT_FRAGMENTS, 
  getEventNameFromTopicHash, 
  getTopicHashFromEventName, 
  isRelevantSmartContractEvent, 
  StateChangeContractEvent } from "../../contracts/agent.registry";
import { assertExists, assertIsNonEmptyString } from "../../utils";
import { GetFromIpfs, IpfsManifestData } from "../../utils/ipfs/get.from.ipfs";
import { providers } from "ethers";
import { EventFilter, GetLogsFromPolyscan, PolyscanLog } from "../../utils/polyscan/get.logs.from.polyscan";
import { chain } from "lodash";


export default function provideInfo(
    agentId: string,
    args: any,
    ethersAgentRegistryProvider: providers.JsonRpcProvider,
    agentRegistry: AgentRegistry,
    agentRegistryContractAddress: string,
    getFromIpfs: GetFromIpfs,
    getLogsFromPolyscan: GetLogsFromPolyscan
): CommandHandler {
    assertExists(args, 'args')
    assertExists(ethersAgentRegistryProvider, 'ethersAgentRegistryProvider')
    assertExists(agentRegistry, 'agentRegistry')
    assertExists(agentRegistryContractAddress, 'agentRegistryContractAddress')
    assertExists(getFromIpfs, 'getFromIpfs')
    assertExists(getLogsFromPolyscan, 'getLogsFromPolyscan')

    return async function info() {
        const finalAgentId = args.agentId ? args.agentId : agentId;

        assertIsNonEmptyString(finalAgentId, 'agentId');

        console.log(`Fetching bot info...`);

        const [agent, currentState] = await Promise.all([ 
             await agentRegistry.getAgent(finalAgentId), 
             await agentRegistry.isEnabled(finalAgentId) as boolean,
        ]);

        
        const ipfsMetaHash = agent.metadata;

        const ipfsData = (await getFromIpfs(ipfsMetaHash)).manifest


        const eventTopicFilters = AGENT_REGISTRY_EVENT_FRAGMENTS
            .filter(fragment => (isRelevantSmartContractEvent(fragment.name)))
            .map(eventFragment => {
                return {
                    type: eventFragment.name,
                    topicHash: getTopicHashFromEventName(eventFragment.name as StateChangeContractEvent)
                } as EventFilter
            });



        const logs: PolyscanLog[] = [];

        await Promise.all(eventTopicFilters.map(async filter => {
            const eventLogs = await getLogsFromPolyscan(agentRegistryContractAddress, filter, finalAgentId);
            logs.push(...eventLogs)
        }))

        const filteredLogs = filterSimultaneousEventsOnBotCreation(logs)

        filteredLogs.sort((logOne, logTwo) => logOne.timeStamp < logTwo.timeStamp ? 1 : -1)

        printIpfsMetaData(ipfsData,currentState)

        console.log(`Recent Activity: \n`);

        for (let log of filteredLogs) {
            const eventName = getEventNameFromTopicHash(log.topics[0]);
            console.log(` [${formatDate(new Date(log.timeStamp * 1000))}] ${formatEventName(eventName)} by ${ipfsData.from} (https://polygonscan.com/tx/${log.transactionHash})\n`)
        }
    }
}

export const formatIpfsData = (data: IpfsManifestData, isBotEnabled: boolean) => {
    return {
        name: data.name,
        botId: data.agentIdHash,
        status: isBotEnabled ? "Enabled" : "Disabled",
        version: data.version,
        owner: data.from,
        image: data.imageReference,
        publishedFrom: data.publishedFrom,
        timestamp: formatDate(new Date(data.timestamp)),
        documentation: ` https://ipfs.io/ipfs/${data.documentation}`
    }
}

const printIpfsMetaData = (ipfsData: IpfsManifestData, botStatus: boolean) => {
    const formattedData = formatIpfsData(ipfsData, botStatus)
    console.log("\n")
    Object.entries(formattedData).forEach(([key, value]) => console.log(`${key}: ${value}`))
    console.log("\n")
}

const formatEventName = (eventName: string): string => {
    if(eventName === "Transfer") {
        return "Bot Created";
    }

    return eventName.replace("Agent", "Bot ");
}

export const formatDate = (date: Date): string => {
    const timeFormatter = new Intl.DateTimeFormat('default', {hour: 'numeric', minute: '2-digit', second: '2-digit', timeZoneName: 'short', hour12: false})
    const monthFormatter = new Intl.DateTimeFormat('default', {month: 'short', year: "numeric"})
    const dayFormatter = new Intl.DateTimeFormat('default', {day: '2-digit' })
    return `${dayFormatter.format(date)} ${monthFormatter.format(date)} ${timeFormatter.format(date)}`
}

const filterSimultaneousEventsOnBotCreation = (logs: PolyscanLog[]): PolyscanLog[] => {
    return chain(logs)
    .groupBy("timeStamp")
    .map((value) => {
        // Filter updated events fired at the same time as created event
        const transferEvent = value.find(el => el.topics[0] === getTopicHashFromEventName("Transfer"))
        if(value.length > 1 && transferEvent) {
            return [transferEvent] as PolyscanLog[]
        }
        return value
    })
    .flatten()
    .value()
}

