import { provideRunLive, RunLive } from "./run.live";

describe("runLive", () => {
  let runLive: RunLive;
  const mockEthersProvider = {
    getBlockNumber: jest.fn(),
    getNetwork: jest.fn(),
  } as any;
  const mockGetAgentHandlers = jest.fn();
  const mockGetSubscriptionAlerts = jest.fn();
  const mockRunHandlersOnBlock = jest.fn();
  const mockRunHandlersOnAlert = jest.fn();
  const mockSleep = jest.fn();
  const mockShouldContinuePolling = jest.fn();
  const mockInitializeResponse = {
    alertConfig: {
      subscriptions: [{ botId: "0x123", alertId: "ALERT-1" }],
    },
  };
  const latestBlockNumber = 1000;
  const systemTime = new Date();

  const resetMocks = () => {
    mockGetAgentHandlers.mockReset();
    mockGetSubscriptionAlerts.mockReset();
    mockRunHandlersOnBlock.mockReset();
    mockRunHandlersOnAlert.mockReset();
    mockEthersProvider.getBlockNumber.mockReset();
    mockEthersProvider.getNetwork.mockReset();
    mockSleep.mockReset();
    mockShouldContinuePolling.mockReset();
  };

  const blockChainNetwork = { chainId: 1 };

  beforeAll(() => {
    runLive = provideRunLive(
      mockGetAgentHandlers,
      mockGetSubscriptionAlerts,
      mockEthersProvider,
      mockRunHandlersOnBlock,
      mockRunHandlersOnAlert,
      mockSleep
    );
    jest.useFakeTimers("modern").setSystemTime(systemTime);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => resetMocks());

  it("throws error if no handlers found", async () => {
    mockGetAgentHandlers.mockReturnValue({});

    try {
      await runLive();
    } catch (e) {
      expect(e.message).toEqual("no block/transaction/alert handler found");
    }

    expect(mockGetAgentHandlers).toHaveBeenCalledTimes(1);
  });

  it("processes latest block on first iteration", async () => {
    mockGetAgentHandlers.mockReturnValue({
      handleBlock: jest.fn(),
    });
    mockShouldContinuePolling
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    mockEthersProvider.getBlockNumber.mockReturnValueOnce(latestBlockNumber);
    mockEthersProvider.getNetwork.mockReturnValueOnce(blockChainNetwork);

    await runLive(mockShouldContinuePolling);

    expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledTimes(1);
    expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledWith();
    expect(mockRunHandlersOnBlock).toHaveBeenCalledTimes(1);
    expect(mockRunHandlersOnBlock).toHaveBeenCalledWith(latestBlockNumber);
    expect(mockSleep).toHaveBeenCalledTimes(0);
    expect(mockGetSubscriptionAlerts).toHaveBeenCalledTimes(0);
    expect(mockRunHandlersOnAlert).toHaveBeenCalledTimes(0);
  });

  it("processes new blocks on following iterations", async () => {
    mockGetAgentHandlers.mockReturnValue({
      handleTransaction: jest.fn(),
      handleAlert: jest.fn(),
      initializeResponse: mockInitializeResponse,
    });
    const mockAlert = {
      alertId: "ALERT-1",
      hash: "0x123",
    };
    mockGetSubscriptionAlerts
      .mockReturnValueOnce([mockAlert])
      .mockReturnValueOnce([]);
    mockShouldContinuePolling
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    mockEthersProvider.getBlockNumber
      .mockReturnValueOnce(latestBlockNumber)
      .mockReturnValueOnce(latestBlockNumber + 3);
    mockEthersProvider.getNetwork.mockReturnValueOnce(blockChainNetwork);

    await runLive(mockShouldContinuePolling);

    expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledTimes(2);
    expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledWith();
    expect(mockRunHandlersOnBlock).toHaveBeenCalledTimes(4);
    expect(mockRunHandlersOnBlock).toHaveBeenCalledWith(latestBlockNumber);
    expect(mockRunHandlersOnBlock).toHaveBeenCalledWith(latestBlockNumber + 1);
    expect(mockRunHandlersOnBlock).toHaveBeenCalledWith(latestBlockNumber + 2);
    expect(mockRunHandlersOnBlock).toHaveBeenCalledWith(latestBlockNumber + 3);
    expect(mockGetSubscriptionAlerts).toHaveBeenCalledTimes(1);
    expect(mockGetSubscriptionAlerts).toHaveBeenCalledWith(
      mockInitializeResponse.alertConfig.subscriptions,
      new Date(systemTime.getTime() - 60000)
    );
    expect(mockRunHandlersOnAlert).toHaveBeenCalledTimes(1);
    expect(mockRunHandlersOnAlert).toHaveBeenCalledWith(mockAlert);
    expect(mockSleep).toHaveBeenCalledTimes(0);
  });

  it("waits if there are no new blocks", async () => {
    mockGetAgentHandlers.mockReturnValue({
      handleBlock: jest.fn(),
    });
    mockShouldContinuePolling
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    mockEthersProvider.getBlockNumber
      .mockReturnValueOnce(latestBlockNumber)
      .mockReturnValueOnce(latestBlockNumber);
    mockEthersProvider.getNetwork.mockReturnValueOnce(blockChainNetwork);

    await runLive(mockShouldContinuePolling);

    expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledTimes(2);
    expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledWith();
    expect(mockRunHandlersOnBlock).toHaveBeenCalledTimes(1);
    expect(mockRunHandlersOnBlock).toHaveBeenCalledWith(latestBlockNumber);
    expect(mockSleep).toHaveBeenCalledTimes(1);
    expect(mockSleep).toHaveBeenCalledWith(15000);
  });
});
