import provideGetLogsForBlock, {
  getCacheKey,
  GetLogsForBlock,
} from "./get.logs.for.block";

describe("getLogsForBlock", () => {
  let getLogsForBlock: GetLogsForBlock;
  const mockEthersProvider = {
    send: jest.fn(),
  } as any;
  const mockCache = {
    getKey: jest.fn(),
    setKey: jest.fn(),
  } as any;
  const mockBlockNumber = 1000;

  const resetMocks = () => {
    mockEthersProvider.send.mockReset();
    mockCache.getKey.mockReset();
    mockCache.setKey.mockReset();
  };

  beforeEach(() => resetMocks());

  beforeAll(() => {
    getLogsForBlock = provideGetLogsForBlock(mockEthersProvider, mockCache);
  });

  it("returns cached logs if they exist", async () => {
    const mockLogs = [
      { transactionHash: "0xabc", blockNumber: mockBlockNumber },
    ];
    mockCache.getKey.mockReturnValueOnce(mockLogs);

    const logs = await getLogsForBlock(mockBlockNumber);

    expect(logs).toStrictEqual(mockLogs);
    expect(mockCache.getKey).toHaveBeenCalledTimes(1);
    expect(mockCache.getKey).toHaveBeenCalledWith(getCacheKey(mockBlockNumber));
    expect(mockEthersProvider.send).toHaveBeenCalledTimes(0);
    expect(mockCache.setKey).toHaveBeenCalledTimes(0);
  });

  it("invokes eth_getLogs jsonrpc method and returns logs", async () => {
    const mockLogs = [
      { transactionHash: "0xabc", blockNumber: mockBlockNumber },
    ];
    mockEthersProvider.send.mockReturnValueOnce(mockLogs);

    const logs = await getLogsForBlock(mockBlockNumber);

    expect(logs).toStrictEqual(mockLogs);
    expect(mockCache.getKey).toHaveBeenCalledTimes(1);
    expect(mockCache.getKey).toHaveBeenCalledWith(getCacheKey(mockBlockNumber));
    expect(mockEthersProvider.send).toHaveBeenCalledTimes(1);
    const mockBlockNumberHex = `0x${mockBlockNumber.toString(16)}`;
    expect(mockEthersProvider.send).toHaveBeenCalledWith("eth_getLogs", [
      { fromBlock: mockBlockNumberHex, toBlock: mockBlockNumberHex },
    ]);
    expect(mockCache.setKey).toHaveBeenCalledTimes(1);
    expect(mockCache.setKey).toHaveBeenCalledWith(
      getCacheKey(mockBlockNumber),
      mockLogs
    );
  });
});
