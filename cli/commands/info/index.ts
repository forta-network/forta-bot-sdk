import { CommandHandler } from "../..";
import AgentRegistry, 
{ AGENT_REGESTRY_EVENT_FRAGMENTS, 
  getEventNameFromTopicHash, 
  getTopicHashFromEventName, 
  isRelevantSmartContractEvent, 
  StateChangeContractEvent } from "../../contracts/agent.registry";
import { assertExists, assertIsNonEmptyString, getBlockChainNetworkConfig } from "../../utils";
import { formatIpfsData, GetFromIpfs, IpfsMetadata } from "../../utils/ipfs/get.from.ipfs";
import { providers } from "ethers";
import { GetTransactionReceipt } from "../../utils/get.transaction.receipt";
import { flatten } from "lodash";

const SECONDS_IN_DAY = 86000;
const DEFAULT_DAYS_TO_SCAN = 30;

export default function provideInfo(
    agentId: string,
    args: any,
    ethersAgentRegistryProvider: providers.JsonRpcProvider,
    agentRegistry: AgentRegistry,
    agentRegistryContractAddress: string,
    getFromIpfs: GetFromIpfs,
    getTransactionReceipt: GetTransactionReceipt,
): CommandHandler {
    assertExists(args, 'args')
    assertExists(ethersAgentRegistryProvider, 'ethersAgentRegistryProvider')
    assertExists(agentRegistry, 'agentRegistry')
    assertExists(agentRegistryContractAddress, 'agentRegistryContractAddress')
    assertExists(getFromIpfs, 'getFromIpfs')
    assertExists(getTransactionReceipt, 'getTransactionReceipt')

    return async function info(daysToScan = DEFAULT_DAYS_TO_SCAN) {
        const finalAgentId = args.agentId ? args.agentId : agentId;

        assertIsNonEmptyString(finalAgentId, 'agentId');

        const agent = await agentRegistry.getAgent(finalAgentId);
        const currentState = await agentRegistry.isEnabled(finalAgentId) as boolean
        const ipfsMetaHash = agent.metadata;


        const ipfsData = await getFromIpfs(ipfsMetaHash)
        printIpfsMetaData(ipfsData,currentState)

        console.log(`Recent Activity (Last ${daysToScan} days): \n`);

        const blockEventTopicFilters = AGENT_REGESTRY_EVENT_FRAGMENTS
            .filter(fragment => isRelevantSmartContractEvent(fragment.name))
            .map(eventFragment => getTopicHashFromEventName(eventFragment.name as StateChangeContractEvent)) as string[];

        const latestBlockNumber = await ethersAgentRegistryProvider.getBlockNumber();

        const network = await ethersAgentRegistryProvider.getNetwork();
        const { chainId } = network;
        const { blockTimeInSeconds } = getBlockChainNetworkConfig(chainId);

        console.log(`Days to scan is: ${daysToScan}, Block to subtract is: ${(daysToScan * SECONDS_IN_DAY)/(blockTimeInSeconds)}`)
        const endingBlock = Math.floor(latestBlockNumber - ((daysToScan * SECONDS_IN_DAY)/(blockTimeInSeconds)));

        const increment = 1000;
        let startingBlock = latestBlockNumber - (increment * 5);

        const getAgentLogs = async (startBlock: number, endBlock: number) => {
            return await ethersAgentRegistryProvider.getLogs({
                address: agentRegistryContractAddress,
                fromBlock: startBlock,
                toBlock: endBlock,
                topics: [[...blockEventTopicFilters], null] // This assumes that each smart contract event is indexed so that the first topic is always an event of interest
            });
        }
        
        console.log(`Starting block: ${startingBlock} and ending Block: ${endingBlock}`)
        while(startingBlock > endingBlock) {
            
            // Get logs in parallel from 5 diffrent block ranges
            const response = (await Promise.all([
                getAgentLogs(startingBlock, startingBlock + increment), 
                getAgentLogs(startingBlock + increment + 1, startingBlock + (increment * 2)),
                getAgentLogs(startingBlock + (2 * increment) + 1, startingBlock + (increment * 3)),
                getAgentLogs(startingBlock + (3 * increment) + 1, startingBlock + (increment * 4)),
                getAgentLogs(startingBlock + (4 * increment) + 1, startingBlock + (increment * 5))
            ]))

            const logs = flatten(response)

            for (let log of logs) {
                const transaction = await getTransactionReceipt(log.transactionHash, true);

                if(transaction.from.toLowerCase() === ipfsData.from.toLowerCase()) {
                    const block = await ethersAgentRegistryProvider.getBlock(log.blockNumber)
                    const eventName = getEventNameFromTopicHash(log.topics[0]);
                    console.log(` - ${formatEventName(eventName)} by ${ipfsData.from} on ${new Date(block.timestamp * 1000)} (https://polygonscan.com/tx/${transaction.transactionHash})\n \n`)
                }
            }

            startingBlock -= (increment * 5) + 1;
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

