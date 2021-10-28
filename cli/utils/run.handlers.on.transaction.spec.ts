import { provideRunHandlersOnTransaction, RunHandlersOnTransaction } from "./run.handlers.on.transaction"

describe("runHandlersOnTransaction", () => {
  let runHandlersOnTransaction: RunHandlersOnTransaction
  const mockGetAgentHandlers = jest.fn()
  const mockGetNetworkId = jest.fn()
  const mockGetTransactionReceipt = jest.fn()
  const mockGetBlockWithTransactions = jest.fn()
  const mockGetTraceData = jest.fn().mockReturnValue([])
  const mockCreateTransactionEvent = jest.fn()
  const mockTxHash = "0x123"

  beforeAll(() => {
    runHandlersOnTransaction = provideRunHandlersOnTransaction(
      mockGetAgentHandlers, mockGetNetworkId, mockGetTransactionReceipt, mockGetBlockWithTransactions, mockGetTraceData, mockCreateTransactionEvent
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
    mockGetNetworkId.mockReturnValueOnce(mockNetworkId)
    const mockReceipt = { blockNumber: 123, transactionHash: mockTxHash }
    mockGetTransactionReceipt.mockReturnValueOnce(mockReceipt)
    const mockBlock = { hash: '0xabc' }
    mockGetBlockWithTransactions.mockReturnValueOnce(mockBlock)
    const mockTxEvent = {}
    mockCreateTransactionEvent.mockReturnValueOnce(mockTxEvent)

    await runHandlersOnTransaction(mockTxHash)

    expect(mockGetAgentHandlers).toHaveBeenCalledTimes(1)
    expect(mockGetAgentHandlers).toHaveBeenCalledWith()
    expect(mockGetNetworkId).toHaveBeenCalledTimes(1)
    expect(mockGetNetworkId).toHaveBeenCalledWith()
    expect(mockGetTransactionReceipt).toHaveBeenCalledTimes(1)
    expect(mockGetTransactionReceipt).toHaveBeenCalledWith(mockTxHash)
    expect(mockGetBlockWithTransactions).toHaveBeenCalledTimes(1)
    expect(mockGetBlockWithTransactions).toHaveBeenCalledWith(mockReceipt.blockNumber)
    expect(mockGetTraceData).toHaveBeenCalledTimes(1)
    expect(mockGetTraceData).toHaveBeenCalledWith(mockReceipt.transactionHash)
    expect(mockCreateTransactionEvent).toHaveBeenCalledTimes(1)
    expect(mockCreateTransactionEvent).toHaveBeenCalledWith(mockReceipt, mockBlock, mockNetworkId, [])
    expect(mockHandleTransaction).toHaveBeenCalledTimes(1)
    expect(mockHandleTransaction).toHaveBeenCalledWith(mockTxEvent)
  })
})