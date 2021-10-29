import { ethers } from "ethers"
import provideGetBlockWithTransactions, { GetBlockWithTransactions } from "./get.block.with.transactions"

describe("getBlockWithTransactions", () => {
  let getBlockWithTransactions: GetBlockWithTransactions
  const mockEthersProvider = {
    send: jest.fn()
  } as any

  const resetMocks = () => {
    mockEthersProvider.send.mockReset()
  }

  beforeAll(() => {
    getBlockWithTransactions = provideGetBlockWithTransactions(mockEthersProvider)
  })

  beforeEach(() => {
    resetMocks()
  })

  it("for integer block number, invokes eth_getBlockByNumber jsonrpc method and returns block", async () => {
    const mockBlockNumber = 123
    const mockBlock = { hash: "0xabc", number: mockBlockNumber }
    mockEthersProvider.send.mockReturnValueOnce(mockBlock)

    const block = await getBlockWithTransactions(mockBlockNumber)

    expect(block).toStrictEqual(mockBlock)
    expect(mockEthersProvider.send).toHaveBeenCalledTimes(1)
    expect(mockEthersProvider.send).toHaveBeenCalledWith("eth_getBlockByNumber", [ethers.utils.hexValue(mockBlockNumber), true])
  })

  it("for string block number, invokes eth_getBlockByNumber jsonrpc method and returns block", async () => {
    const mockBlockNumber = "123"
    const mockBlock = { hash: "0xabc", number: mockBlockNumber }
    mockEthersProvider.send.mockReturnValueOnce(mockBlock)

    const block = await getBlockWithTransactions(mockBlockNumber)

    expect(block).toStrictEqual(mockBlock)
    expect(mockEthersProvider.send).toHaveBeenCalledTimes(1)
    expect(mockEthersProvider.send).toHaveBeenCalledWith("eth_getBlockByNumber", [ethers.utils.hexValue(parseInt(mockBlockNumber)), true])
  })

  it("for string block hash, invokes eth_getBlockByHash jsonrpc method and returns block", async () => {
    const mockBlockNumber = "0x123"
    const mockBlock = { hash: "0xabc", number: mockBlockNumber }
    mockEthersProvider.send.mockReturnValueOnce(mockBlock)

    const block = await getBlockWithTransactions(mockBlockNumber)

    expect(block).toStrictEqual(mockBlock)
    expect(mockEthersProvider.send).toHaveBeenCalledTimes(1)
    expect(mockEthersProvider.send).toHaveBeenCalledWith("eth_getBlockByHash", [ethers.utils.hexValue(mockBlockNumber), true])
  })
})