import { CommandHandler } from "../..";
import AgentRegistry, 
{ AGENT_REGESTRY_EVENT_FRAGMENTS, 
  getEventNameFromTopicHash, 
  getTopicHashFromEventName, 
  isRelevantSmartContractEvent, 
  StateChangeContractEvent } from "../../contracts/agent.registry";
import { assertExists, assertIsNonEmptyString, getBlockChainNetworkConfig } from "../../utils";
import { GetFromIpfs, IpfsMetadata } from "../../utils/ipfs/get.from.ipfs";
import { providers } from "ethers";
import { GetTransactionReceipt } from "../../utils/get.transaction.receipt";
import { flatten } from "lodash";

const SECONDS_IN_DAY = 86000;
const DAYS_TO_SCAN = 30;

export default function provideInfo(
    agentId: string,
    args: any,
    ethersAgentRegistryProvider: providers.JsonRpcProvider,
    agentRegistry: AgentRegistry,
    agentRegistryContractAddress: string,
    getFromIpfs: GetFromIpfs,
    getTransactionReceipt: GetTransactionReceipt,
): CommandHandler {
    assertExists(getFromIpfs, 'getFromIpfs')

    return async function info() {
        const finalAgentId = args.agentId ? args.agentId : agentId;

        assertIsNonEmptyString(finalAgentId, 'agentId');

        const agent = await agentRegistry.getAgent(finalAgentId);
        const currentState = await agentRegistry.isEnabled(finalAgentId)
        const ipfsMetaHash = agent.metadata;


        const ipfsData = await getFromIpfs(ipfsMetaHash)
        printIpfsMetaData(ipfsData)

        console.log(`Recent Activity (Last ${DAYS_TO_SCAN} days): \n`);

        const blockEventTopicFilters = AGENT_REGESTRY_EVENT_FRAGMENTS
            .filter(fragment => isRelevantSmartContractEvent(fragment.name))
            .map(eventFragment => getTopicHashFromEventName(eventFragment.name as StateChangeContractEvent)) as string[];

        const latestBlockNumber = await ethersAgentRegistryProvider.getBlockNumber();

        const network = await ethersAgentRegistryProvider.getNetwork();
        const { chainId } = network;
        const { blockTimeInSeconds } = getBlockChainNetworkConfig(chainId);

        const endingBlock = Math.floor(latestBlockNumber - ((DAYS_TO_SCAN * SECONDS_IN_DAY)/(blockTimeInSeconds)));

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
        
        while(startingBlock > endingBlock) {
            
            // Get logs in parallel from 5 diffrent block ranges
            const response = (await Promise.all([
                getAgentLogs(startingBlock, startingBlock + increment), 
                getAgentLogs(startingBlock + increment + 1, startingBlock + (increment * 2)),
                getAgentLogs(startingBlock + (2 * increment) + 1, startingBlock + (increment * 3)),
                getAgentLogs(startingBlock + (3 * increment) + 1, startingBlock + (increment * 4)),
                getAgentLogs(startingBlock + (4 * increment) + 1, startingBlock + (increment * 5))
            ]))

            const logs =  flatten(response)

            for (let log of logs) {
                const transaction = await getTransactionReceipt(log.transactionHash, true);

                if(transaction.from.toLowerCase() === ipfsData.from.toLowerCase()) {
                    const block = await ethersAgentRegistryProvider.getBlock(log.blockNumber)
                    const eventName = getEventNameFromTopicHash(log.topics[0]);
                    console.log(` - ${eventName} by ${ipfsData.from} on ${new Date(block.timestamp * 1000)} (https://polygonscan.com/tx/${transaction.transactionHash})\n \n`)
                }
            }

            startingBlock -= (increment * 5) + 1;
        }
    }
}

const printIpfsMetaData = (ipfsData: IpfsMetadata) => {
    console.log("\n")
    Object.entries(ipfsData).forEach(([key, value]) => console.log(`${key}: ${value}`))
}

