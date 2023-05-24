import provideGetLatestBlockNumber, {
  GetLatestBlockNumber,
} from "./get.latest.block.number";

describe("getLatestBlockNumber", () => {
  let getLatestBlockNumber: GetLatestBlockNumber;
  const mockWithRetry = jest.fn();
  const mockEthersProviderSend = jest.fn();

  beforeAll(() => {
    getLatestBlockNumber = provideGetLatestBlockNumber(
      mockWithRetry,
      mockEthersProviderSend
    );
  });

  it("invokes the eth_blockNumber jsonrpc method and returns block number", async () => {
    const mockBlockNumber = "0x3039";
    mockWithRetry.mockReturnValueOnce(mockBlockNumber);

    const blockNumber = await getLatestBlockNumber();

    expect(blockNumber).toEqual(12345); // should convert hex string to decimal number
    expect(mockWithRetry).toHaveBeenCalledTimes(1);
    expect(mockWithRetry).toHaveBeenCalledWith(mockEthersProviderSend, [
      "eth_blockNumber",
      [],
    ]);
  });
});
