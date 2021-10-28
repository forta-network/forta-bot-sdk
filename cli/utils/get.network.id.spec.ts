import provideGetNetworkId, { GetNetworkId } from "./get.network.id"

describe("getNetworkId", () => {
  let getNetworkId: GetNetworkId
  const mockEthersProvider = {
    send: jest.fn()
  } as any

  beforeAll(() => {
    getNetworkId = provideGetNetworkId(mockEthersProvider)
  })

  it("invokes the net_version jsonrpc method and returns network id", async () => {
    const mockNetworkId = 5
    mockEthersProvider.send.mockReturnValueOnce(mockNetworkId)

    const networkId = await getNetworkId()

    expect(networkId).toEqual(mockNetworkId)
    expect(mockEthersProvider.send).toHaveBeenCalledTimes(1)
    expect(mockEthersProvider.send).toHaveBeenCalledWith("net_version", [])
  })
})