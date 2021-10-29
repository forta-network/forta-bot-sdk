import provideGetTransactionReceipt, { GetTransactionReceipt } from "./get.transaction.receipt"

describe("getTransactionReceipt", () => {
  let getTransactionReceipt: GetTransactionReceipt
  const mockEthersProvider = {
    send: jest.fn()
  } as any

  beforeAll(() => {
    getTransactionReceipt = provideGetTransactionReceipt(mockEthersProvider)
  })

  it("invokes eth_getTransactionReceipt jsonrpc method and returns receipt", async () => {
    const mockTxHash = "0x123"
    const mockReceipt = { hash: mockTxHash, blockNumber: 123 }
    mockEthersProvider.send.mockReturnValueOnce(mockReceipt)

    const receipt = await getTransactionReceipt(mockTxHash)

    expect(receipt).toStrictEqual(mockReceipt)
    expect(mockEthersProvider.send).toHaveBeenCalledTimes(1)
    expect(mockEthersProvider.send).toHaveBeenCalledWith('eth_getTransactionReceipt', [mockTxHash])
  })
})