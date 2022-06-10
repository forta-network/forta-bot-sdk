import { Network } from "@ethersproject/networks"
import { providers } from "ethers"
import provideInfo from "."
import { CommandHandler } from "../.."
import { AgentDescription, AGENT_REGISTRY_EVENT_FRAGMENTS, getTopicHashFromEventName, isRelevantSmartContractEvent, StateChangeContractEvent } from "../../contracts/agent.registry"
import { getBlockChainNetworkConfig } from "../../utils"
import { IpfsMetadata } from "../../utils/ipfs/get.from.ipfs"


describe("info", () => {
    let info: CommandHandler

    // Mocks 
    const args = {
        agentId: "0x1234456"
    }

    const mockEthersAgentRegistryProvider = {
        getBlockNumber: jest.fn(),
        getBlock: jest.fn(),
        getNetwork: jest.fn(),
        getLogs: jest.fn()
    }

    const mockAgentRegistry = {
        getAgent: jest.fn(),
        isEnabled: jest.fn()
    }

    const getFromIpfs = jest.fn();
    const getTransactionReceipt = jest.fn()

    const agentRegistryContractAddress = "0x987654";

    const resetMocks = () => {
        mockEthersAgentRegistryProvider.getBlockNumber.mockReset()
        mockEthersAgentRegistryProvider.getNetwork.mockReset()
        mockEthersAgentRegistryProvider.getLogs.mockReset()
        mockEthersAgentRegistryProvider.getBlock.mockReset()
        mockAgentRegistry.getAgent.mockReset()
        mockAgentRegistry.isEnabled.mockReset()
        getFromIpfs.mockReset()
        getTransactionReceipt.mockReset()
    }

    const testNetwork: Network = {
        name: "etherum",
        chainId: 1
    }

    const mockIpfsManifest = {
        "from":"0x123456",
        "name":"Compound Liquidatable Positions Monitor",
        "agentId":"Compound Liquidatable Positions Monitor",
        "agentIdHash":"0x3c61101f1d349661298a58ba59a58fbce5a3626c5c7af10b091796969e0d6c59",
        "version":"0.0.1",
        "timestamp":"Fri, 20 May 2022 15:54:56 GMT",
        "imageReference":"bafybeib5kmox5r2wpre3tgkfgfr76tm4qascagmqvod2wcojxrqmgyxfp4@sha256:2fcfede6f821f4f14e745598fd71b2201471517acd345f7b8f0cd424d35b441a",
        "documentation":"QmQXZvBdZ4eMtCefNXYMRwQ7UJbgW74EqrMv9wS9hoSXV7",
        "repository":"https://github.com/arbitraryexecution/compound-monitoring/tree/main/liquidation-monitor",
        "projects":[
           "compound_v2"
        ],
        "chainIds":[
           1
        ],
        "publishedFrom":"Forta Explorer 0.0.2"
     } as IpfsMetadata

     const mockLogOne: providers.Log = {
        blockNumber: 1500000,
        blockHash: "0x2345",
        transactionIndex: 0,
        removed: false,
        address: "0x424",
        data: "",
        topics: ["0xb3910705ae5b4ecc20f77ab0d947aafd48ed7328af2294ca08dea714b041d641"],
        transactionHash: "0x2352",
        logIndex: 0
    }

    const mockLogTwo: providers.Log = {
        blockNumber: 1490000,
        blockHash: "0x2345",
        transactionIndex: 0,
        removed: false,
        address: "0x424",
        data: "",
        topics: ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"],
        transactionHash: "0x235264",
        logIndex: 0
    }

    const mockAgentDescription: AgentDescription = {
        created: true,
        owner: "0x1458395",
        metadata: "0x23847"
    } 

    // Helper variables and test callbacks
    const blockEventTopicFilters = AGENT_REGISTRY_EVENT_FRAGMENTS
            .filter(fragment => isRelevantSmartContractEvent(fragment.name))
            .map(eventFragment => getTopicHashFromEventName(eventFragment.name as StateChangeContractEvent)) as string[];

    beforeEach(() => {
        resetMocks()
        defaultMocks(true)
    })

    const { blockTimeInSeconds } = getBlockChainNetworkConfig(testNetwork.chainId);
    const testDaysToScan = (5000.5 * blockTimeInSeconds) / 86000;

    beforeAll(() => {
        info = provideInfo("", args, mockEthersAgentRegistryProvider as any, mockAgentRegistry as any ,agentRegistryContractAddress,getFromIpfs, getTransactionReceipt)
    })

    // Helper methods

    const defaultMocks = (isBotEnabled: boolean) => {
        mockAgentRegistry.getAgent.mockReturnValueOnce(mockAgentDescription)
        mockAgentRegistry.isEnabled.mockReturnValue(isBotEnabled)

        getFromIpfs.mockReturnValueOnce(mockIpfsManifest)

        mockEthersAgentRegistryProvider.getBlockNumber.mockReturnValue(2000000)
        mockEthersAgentRegistryProvider.getNetwork.mockReturnValue(testNetwork)
        mockEthersAgentRegistryProvider.getLogs.mockReturnValueOnce(mockLogOne).mockReturnValue(mockLogTwo)

        getTransactionReceipt.mockReturnValue({from: mockIpfsManifest.from, transactionHash: "0x34211"})

        mockEthersAgentRegistryProvider.getBlock.mockReturnValueOnce({timestamp: 1654440565}).mockReturnValue({timestamp: 1654430565})

        console.log = jest.fn()
    }

    it("fetches the current state of a deployed bot", async () => {
        await info(testDaysToScan)

        expect(mockAgentRegistry.isEnabled).toHaveBeenCalledWith(args.agentId)
    })

    it("fetches the most recent ipfs metadata of a deployed bot", async () => {
        await info(testDaysToScan)

        expect(getFromIpfs).toHaveBeenCalledWith(mockAgentDescription.metadata)
    })

    it("filters contract logs by relevent topics", async () => {
        await info(testDaysToScan)

        expect(mockEthersAgentRegistryProvider.getLogs).toHaveBeenCalledWith({
            address: expect.anything(),
            fromBlock: expect.anything(),
            toBlock: expect.anything(),
            topics: [[...blockEventTopicFilters], null]
        })
    })

    it("fecthes 5 different block ranges of logs for the agent registry contract", async () => {
        await info(testDaysToScan)

        expect(mockEthersAgentRegistryProvider.getLogs).toBeCalledTimes(5)
    })

    it("does not attempt to verify any logs if no logs found for agentId", async () => {
        mockEthersAgentRegistryProvider.getLogs.mockReset()
        mockEthersAgentRegistryProvider.getLogs.mockReturnValue([])

        await info(testDaysToScan)
        expect(getTransactionReceipt).toBeCalledTimes(0)
    })

    it("does not print anything if no relevant events found for agentId", async () => {
        getTransactionReceipt.mockReset()
        getTransactionReceipt.mockReturnValue({from: "0x49285772", transactionHash: "0x34211"})

        await info(testDaysToScan)

        expect(mockEthersAgentRegistryProvider.getBlock).toBeCalledTimes(0)
    })
})