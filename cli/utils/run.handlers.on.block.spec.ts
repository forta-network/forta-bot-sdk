import { provideRunHandlersOnBlock, RunHandlersOnBlock } from "./run.handlers.on.block"

describe("runHandlersOnBlock", () => {
  let runHandlersOnBlock: RunHandlersOnBlock
  const mockWeb3 = {
    eth : {
      getBlock: jest.fn(),
      getTransactionReceipt: jest.fn(),
      net: {
        getId: jest.fn()
      }
    }
  } as any
  const mockGetAgentHandlers = jest.fn()
  const mockGetTraceData = jest.fn().mockReturnValue([])
  const mockCreateBlockEvent = jest.fn()
  const mockCreateTransactionEvent = jest.fn()
  const mockBlockHash = '0xabc'
  const mockTxHash = "0x123"

  beforeAll(() => {
    runHandlersOnBlock = provideRunHandlersOnBlock(
      mockWeb3, mockGetAgentHandlers, mockGetTraceData, mockCreateBlockEvent, mockCreateTransactionEvent
    )
  })

  it("throws an error if no handlers found", async () => {
    mockGetAgentHandlers.mockReturnValueOnce({ blockHandlers: [], transactionHandlers: [] })

    try {
      await runHandlersOnBlock(mockBlockHash)
    } catch (e) {
      expect(e.message).toEqual('no block/transaction handlers found')
    }

    expect(mockGetAgentHandlers).toHaveBeenCalledTimes(1)
  })

  it("invokes block handlers with block event and transaction handlers with transaction event for each transaction in block", async () => {
    mockGetAgentHandlers.mockReset()
    const mockHandleBlock = jest.fn().mockReturnValue([])
    const mockHandleTransaction = jest.fn().mockReturnValue([])
    mockGetAgentHandlers.mockReturnValueOnce({ blockHandlers: [mockHandleBlock], transactionHandlers: [mockHandleTransaction]})
    const mockNetworkId = 1
    mockWeb3.eth.net.getId.mockReturnValueOnce(mockNetworkId)
    const mockBlock = { hash: mockBlockHash, number: 7, transactions: [{ hash: mockTxHash }] }
    mockWeb3.eth.getBlock.mockReturnValueOnce(mockBlock)
    const mockBlockEvent = {}
    mockCreateBlockEvent.mockReturnValueOnce(mockBlockEvent)
    const mockReceipt = { transactionHash: mockTxHash }
    mockWeb3.eth.getTransactionReceipt.mockReturnValueOnce(mockReceipt)
    const mockTxEvent = {}
    mockCreateTransactionEvent.mockReturnValueOnce(mockTxEvent)

    await runHandlersOnBlock(mockBlockHash)

    expect(mockGetAgentHandlers).toHaveBeenCalledTimes(1)
    expect(mockGetAgentHandlers).toHaveBeenCalledWith()
    expect(mockWeb3.eth.net.getId).toHaveBeenCalledTimes(1)
    expect(mockWeb3.eth.net.getId).toHaveBeenCalledWith()
    expect(mockWeb3.eth.getBlock).toHaveBeenCalledTimes(1)
    expect(mockWeb3.eth.getBlock).toHaveBeenCalledWith(mockBlockHash, true)
    expect(mockCreateBlockEvent).toHaveBeenCalledTimes(1)
    expect(mockCreateBlockEvent).toHaveBeenCalledWith(mockBlock, mockNetworkId)
    expect(mockHandleBlock).toHaveBeenCalledTimes(1)
    expect(mockHandleBlock).toHaveBeenCalledWith(mockBlockEvent)
    expect(mockGetTraceData).toHaveBeenCalledTimes(1)
    expect(mockGetTraceData).toHaveBeenCalledWith(mockBlock.number)
    expect(mockWeb3.eth.getTransactionReceipt).toHaveBeenCalledTimes(1)
    expect(mockWeb3.eth.getTransactionReceipt).toHaveBeenCalledWith(mockTxHash)
    expect(mockCreateTransactionEvent).toHaveBeenCalledTimes(1)
    expect(mockCreateTransactionEvent).toHaveBeenCalledWith(mockReceipt, mockBlock, mockNetworkId, undefined)
    expect(mockHandleTransaction).toHaveBeenCalledTimes(1)
    expect(mockHandleTransaction).toHaveBeenCalledWith(mockTxEvent)
  })
})