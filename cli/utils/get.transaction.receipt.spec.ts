import provideGetTransactionReceipt, { GetTransactionReceipt } from "./get.transaction.receipt"

describe("getTransactionReceipt", () => {
  let getTransactionReceipt: GetTransactionReceipt
  const mockEthersProvider = {
    send: jest.fn()
  } as any
  const mockCache = {
    getKey: jest.fn(),
    setKey: jest.fn()
  } as any

  const resetMocks = () => {
    mockEthersProvider.send.mockReset()
    mockCache.getKey.mockReset()
    mockCache.setKey.mockReset()
  }

  beforeAll(() => {
    getTransactionReceipt = provideGetTransactionReceipt(mockEthersProvider, mockCache)
  })

  beforeEach(() => resetMocks())

  it("returns cached receipt if it exists", async () => {
    const mockTxHash = "0x123Abc"
    const mockReceipt = { hash: mockTxHash, blockNumber: 123 }
    mockCache.getKey.mockReturnValueOnce(mockReceipt)

    const receipt = await getTransactionReceipt(mockTxHash)

    expect(receipt).toStrictEqual(mockReceipt)
    expect(mockCache.getKey).toHaveBeenCalledTimes(1)
    expect(mockCache.getKey).toHaveBeenCalledWith(mockTxHash.toLowerCase())
    expect(mockEthersProvider.send).toHaveBeenCalledTimes(0)
    expect(mockCache.setKey).toHaveBeenCalledTimes(0)
  })

  it("invokes eth_getTransactionReceipt jsonrpc method and returns receipt", async () => {
    const mockTxHash = "0x123"
    const mockReceipt = { hash: mockTxHash, blockNumber: 123 }
    mockEthersProvider.send.mockReturnValueOnce(mockReceipt)

    const receipt = await getTransactionReceipt(mockTxHash)

    expect(receipt).toStrictEqual(mockReceipt)
    expect(mockCache.getKey).toHaveBeenCalledTimes(1)
    expect(mockCache.getKey).toHaveBeenCalledWith(mockTxHash.toLowerCase())
    expect(mockEthersProvider.send).toHaveBeenCalledTimes(1)
    expect(mockEthersProvider.send).toHaveBeenCalledWith('eth_getTransactionReceipt', [mockTxHash])
    expect(mockCache.setKey).toHaveBeenCalledTimes(1)
    expect(mockCache.setKey).toHaveBeenCalledWith(mockTxHash.toLowerCase(), mockReceipt)
  })
})