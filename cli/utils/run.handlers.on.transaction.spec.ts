import { provideRunHandlersOnTransaction, RunHandlersOnTransaction } from "./run.handlers.on.transaction"

describe("runHandlersOnTransaction", () => {
  let runHandlersOnTransaction: RunHandlersOnTransaction
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
  const mockCreateTransactionEvent = jest.fn()
  const mockTxHash = "0x123"

  beforeAll(() => {
    runHandlersOnTransaction = provideRunHandlersOnTransaction(
      mockWeb3, mockGetAgentHandlers, mockGetTraceData, mockCreateTransactionEvent
    )
  })

  it("throws error if no transaction handler found", async () => {
    mockGetAgentHandlers.mockReturnValueOnce({ })

    try {
      await runHandlersOnTransaction(mockTxHash)
    } catch (e) {
      expect(e.message).toEqual('no transaction handler found')
    }

    expect(mockGetAgentHandlers).toHaveBeenCalledTimes(1)
  })

  it("invokes transaction handler with transaction event", async () => {
    mockGetAgentHandlers.mockReset()
    const mockHandleTransaction = jest.fn().mockReturnValue([])
    mockGetAgentHandlers.mockReturnValueOnce({ handleTransaction: mockHandleTransaction })
    const mockNetworkId = 1
    mockWeb3.eth.net.getId.mockReturnValueOnce(mockNetworkId)
    const mockReceipt = { blockHash: '0xabc', transactionHash: mockTxHash }
    mockWeb3.eth.getTransactionReceipt.mockReturnValueOnce(mockReceipt)
    const mockBlock = { hash: '0xabc' }
    mockWeb3.eth.getBlock.mockReturnValueOnce(mockBlock)
    const mockTxEvent = {}
    mockCreateTransactionEvent.mockReturnValueOnce(mockTxEvent)

    await runHandlersOnTransaction(mockTxHash)

    expect(mockGetAgentHandlers).toHaveBeenCalledTimes(1)
    expect(mockGetAgentHandlers).toHaveBeenCalledWith()
    expect(mockWeb3.eth.net.getId).toHaveBeenCalledTimes(1)
    expect(mockWeb3.eth.net.getId).toHaveBeenCalledWith()
    expect(mockWeb3.eth.getTransactionReceipt).toHaveBeenCalledTimes(1)
    expect(mockWeb3.eth.getTransactionReceipt).toHaveBeenCalledWith(mockTxHash)
    expect(mockWeb3.eth.getBlock).toHaveBeenCalledTimes(1)
    expect(mockWeb3.eth.getBlock).toHaveBeenCalledWith(mockReceipt.blockHash, true)
    expect(mockGetTraceData).toHaveBeenCalledTimes(1)
    expect(mockGetTraceData).toHaveBeenCalledWith(mockReceipt.transactionHash)
    expect(mockCreateTransactionEvent).toHaveBeenCalledTimes(1)
    expect(mockCreateTransactionEvent).toHaveBeenCalledWith(mockReceipt, mockBlock, mockNetworkId, [])
    expect(mockHandleTransaction).toHaveBeenCalledTimes(1)
    expect(mockHandleTransaction).toHaveBeenCalledWith(mockTxEvent)
  })
})