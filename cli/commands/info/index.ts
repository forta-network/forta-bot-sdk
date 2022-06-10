import { CommandHandler } from "../..";
import AgentRegistry, 
{ AGENT_REGISTRY_EVENT_FRAGMENTS, 
  getEventNameFromTopicHash, 
  getTopicHashFromEventName, 
  isRelevantSmartContractEvent, 
  StateChangeContractEvent } from "../../contracts/agent.registry";
import { assertExists, assertIsNonEmptyString, getBlockChainNetworkConfig } from "../../utils";
import { formatIpfsData, GetFromIpfs, IpfsMetadata } from "../../utils/ipfs/get.from.ipfs";
import { providers } from "ethers";
import { GetTransactionReceipt } from "../../utils/get.transaction.receipt";
import { EventFilter, GetLogsFromPolyscan, PolyscanLog } from "../../utils/polyscan/get.logs.from.polyscan";


export default function provideInfo(
    agentId: string,
    args: any,
    ethersAgentRegistryProvider: providers.JsonRpcProvider,
    agentRegistry: AgentRegistry,
    agentRegistryContractAddress: string,
    getFromIpfs: GetFromIpfs,
    getTransactionReceipt: GetTransactionReceipt,
    getLogsFromPolyscan: GetLogsFromPolyscan
): CommandHandler {
    assertExists(args, 'args')
    assertExists(ethersAgentRegistryProvider, 'ethersAgentRegistryProvider')
    assertExists(agentRegistry, 'agentRegistry')
    assertExists(agentRegistryContractAddress, 'agentRegistryContractAddress')
    assertExists(getFromIpfs, 'getFromIpfs')
    assertExists(getTransactionReceipt, 'getTransactionReceipt')

    return async function info() {
        const finalAgentId = args.agentId ? args.agentId : agentId;

        assertIsNonEmptyString(finalAgentId, 'agentId');

        const [agent, currentState] = await Promise.all([ 
             await agentRegistry.getAgent(finalAgentId), 
             await agentRegistry.isEnabled(finalAgentId) as boolean,
        ]);

        
        const ipfsMetaHash = agent.metadata;


        const ipfsData = await getFromIpfs(ipfsMetaHash)
        printIpfsMetaData(ipfsData,currentState)

        console.log(`Recent Activity: \n`);
        console.log(`Fetching bot info...`);


        const eventTopicFilters = AGENT_REGISTRY_EVENT_FRAGMENTS
            .filter(fragment => (isRelevantSmartContractEvent(fragment.name)))
            .map(eventFragment => {
                return {
                    type: eventFragment.name,
                    topic_0: getTopicHashFromEventName(eventFragment.name as StateChangeContractEvent)
                } as EventFilter
            });



        const logs: PolyscanLog[] = [];

        await Promise.all(eventTopicFilters.map(async filter => {
            const eventLogs = await getLogsFromPolyscan(agentRegistryContractAddress, filter, finalAgentId);
            logs.push(...eventLogs)
        }))
        
        logs.sort((logOne, logTwo) => logOne.timeStamp < logTwo.timeStamp ? 1 : -1)
        
        for (let log of logs) {
            const eventName = getEventNameFromTopicHash(log.topics[0]);
            console.log(` - ${formatEventName(eventName)} by ${ipfsData.from} on  ${new Date(log.timeStamp * 1000)} (https://polygonscan.com/tx/${log.transactionHash})\n \n`)
        }
    }
}

const printIpfsMetaData = (ipfsData: IpfsMetadata, botStatus: boolean) => {
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

