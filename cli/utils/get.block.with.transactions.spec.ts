import { ethers } from "ethers"
import provideGetBlockWithTransactions, { GetBlockWithTransactions } from "./get.block.with.transactions"

describe("getBlockWithTransactions", () => {
  let getBlockWithTransactions: GetBlockWithTransactions
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
    getBlockWithTransactions = provideGetBlockWithTransactions(mockEthersProvider, mockCache)
  })

  beforeEach(() => {
    resetMocks()
  })

  it("for integer block number, returns cached block if it exists", async () => {
    const mockBlockNumber = 123
    const mockBlock = { hash: "0xabc", number: mockBlockNumber }
    mockCache.getKey.mockReturnValueOnce(mockBlock)

    const block = await getBlockWithTransactions(mockBlockNumber)

    expect(block).toStrictEqual(mockBlock)
    expect(mockCache.getKey).toHaveBeenCalledTimes(1)
    expect(mockCache.getKey).toHaveBeenCalledWith(mockBlockNumber.toString())
    expect(mockEthersProvider.send).toHaveBeenCalledTimes(0)
    expect(mockCache.setKey).toHaveBeenCalledTimes(0)
  })

  it("for integer block number, invokes eth_getBlockByNumber jsonrpc method and returns block", async () => {
    const mockBlockNumber = 123
    const mockBlock = { hash: "0xaBc", number: mockBlockNumber }
    mockEthersProvider.send.mockReturnValueOnce(mockBlock)

    const block = await getBlockWithTransactions(mockBlockNumber)

    expect(block).toStrictEqual(mockBlock)
    expect(mockCache.getKey).toHaveBeenCalledTimes(1)
    expect(mockCache.getKey).toHaveBeenCalledWith(mockBlockNumber.toString())
    expect(mockEthersProvider.send).toHaveBeenCalledTimes(1)
    expect(mockEthersProvider.send).toHaveBeenCalledWith("eth_getBlockByNumber", [ethers.utils.hexValue(mockBlockNumber), true])
    expect(mockCache.setKey).toHaveBeenCalledTimes(2)
    expect(mockCache.setKey).toHaveBeenCalledWith(mockBlock.hash.toLowerCase(), mockBlock)
    expect(mockCache.setKey).toHaveBeenCalledWith(mockBlock.number.toString(), mockBlock)
  })

  it("for string block number, invokes eth_getBlockByNumber jsonrpc method and returns block", async () => {
    const mockBlockNumber = "123"
    const mockBlock = { hash: "0xabC", number: mockBlockNumber }
    mockEthersProvider.send.mockReturnValueOnce(mockBlock)

    const block = await getBlockWithTransactions(mockBlockNumber)

    expect(block).toStrictEqual(mockBlock)
    expect(mockCache.getKey).toHaveBeenCalledTimes(1)
    expect(mockCache.getKey).toHaveBeenCalledWith(mockBlockNumber.toString())
    expect(mockEthersProvider.send).toHaveBeenCalledTimes(1)
    expect(mockEthersProvider.send).toHaveBeenCalledWith("eth_getBlockByNumber", [ethers.utils.hexValue(parseInt(mockBlockNumber)), true])
    expect(mockCache.setKey).toHaveBeenCalledTimes(2)
    expect(mockCache.setKey).toHaveBeenCalledWith(mockBlock.hash.toLowerCase(), mockBlock)
    expect(mockCache.setKey).toHaveBeenCalledWith(mockBlock.number.toString(), mockBlock)
  })

  it("for string block hash, invokes eth_getBlockByHash jsonrpc method and returns block", async () => {
    const mockBlockHash = "0xAbc"
    const mockBlock = { hash: mockBlockHash, number: 123 }
    mockEthersProvider.send.mockReturnValueOnce(mockBlock)

    const block = await getBlockWithTransactions(mockBlockHash)

    expect(block).toStrictEqual(mockBlock)
    expect(mockCache.getKey).toHaveBeenCalledTimes(1)
    expect(mockCache.getKey).toHaveBeenCalledWith(mockBlockHash.toLowerCase())
    expect(mockEthersProvider.send).toHaveBeenCalledTimes(1)
    expect(mockEthersProvider.send).toHaveBeenCalledWith("eth_getBlockByHash", [ethers.utils.hexValue(mockBlockHash), true])
    expect(mockCache.setKey).toHaveBeenCalledTimes(2)
    expect(mockCache.setKey).toHaveBeenCalledWith(mockBlock.hash.toLowerCase(), mockBlock)
    expect(mockCache.setKey).toHaveBeenCalledWith(mockBlock.number.toString(), mockBlock)
  })
})