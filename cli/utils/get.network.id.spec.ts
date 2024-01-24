import provideGetNetworkId, { GetNetworkId } from "./get.network.id";

describe("getNetworkId", () => {
  let getNetworkId: GetNetworkId;
  const mockWithRetry = jest.fn();
  const mockEthersProviderSend = jest.fn();

  beforeAll(() => {
    getNetworkId = provideGetNetworkId(mockWithRetry, mockEthersProviderSend);
  });

  it("invokes the eth_chainId jsonrpc method and returns chain id", async () => {
    const mockNetworkId = "0xf";
    mockWithRetry.mockReturnValueOnce(mockNetworkId);

    const networkId = await getNetworkId();

    expect(networkId).toEqual(15);
    expect(mockWithRetry).toHaveBeenCalledTimes(1);
    expect(mockWithRetry).toHaveBeenCalledWith(mockEthersProviderSend, [
      "eth_chainId",
      [],
    ]);
  });
});
