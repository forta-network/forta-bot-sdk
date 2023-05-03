import provideGetNetworkId, { GetNetworkId } from "./get.network.id";

describe("getNetworkId", () => {
  let getNetworkId: GetNetworkId;
  const mockWithRetry = jest.fn();
  const mockEthersProviderSend = jest.fn();

  beforeAll(() => {
    getNetworkId = provideGetNetworkId(mockWithRetry, mockEthersProviderSend);
  });

  it("invokes the net_version jsonrpc method and returns network id", async () => {
    const mockNetworkId = "0xf";
    mockWithRetry.mockReturnValueOnce(mockNetworkId);

    const networkId = await getNetworkId();

    expect(networkId).toEqual(15);
    expect(mockWithRetry).toHaveBeenCalledTimes(1);
    expect(mockWithRetry).toHaveBeenCalledWith(mockEthersProviderSend, [
      "net_version",
      [],
    ]);
  });
});
