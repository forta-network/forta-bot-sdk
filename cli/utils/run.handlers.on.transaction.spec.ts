import { Finding, FindingSeverity, FindingType } from "../../sdk"
import { provideRunHandlersOnTransaction, RunHandlersOnTransaction } from "./run.handlers.on.transaction"

describe("runHandlersOnTransaction", () => {
  let runHandlersOnTransaction: RunHandlersOnTransaction
  const mockGetBotHandlers = jest.fn()
  const mockGetNetworkId = jest.fn()
  const mockGetTransactionReceipt = jest.fn()
  const mockGetBlockWithTransactions = jest.fn()
  const mockGetTraceData = jest.fn().mockReturnValue([])
  const mockCreateTransactionEvent = jest.fn()
  const mockTxHash = "0x123"

  beforeAll(() => {
    runHandlersOnTransaction = provideRunHandlersOnTransaction(
      mockGetBotHandlers, mockGetNetworkId, mockGetTransactionReceipt, mockGetBlockWithTransactions, mockGetTraceData, mockCreateTransactionEvent
    )
  })

  beforeEach(() => {
    mockGetBotHandlers.mockReset()
    mockGetNetworkId.mockReset()
    mockGetTransactionReceipt.mockReset()
    mockGetBlockWithTransactions.mockReset()
    mockGetTraceData.mockReset()
    mockCreateTransactionEvent.mockReset()
  })

  it("throws error if no transaction handler found", async () => {
    mockGetBotHandlers.mockReturnValueOnce({ })

    try {
      await runHandlersOnTransaction(mockTxHash)
    } catch (e) {
      expect(e.message).toEqual('no transaction handler found')
    }

    expect(mockGetBotHandlers).toHaveBeenCalledTimes(1)
  })

  it("invokes transaction handler with transaction event", async () => {
    const mockHandleTransaction = jest.fn().mockReturnValue([])
    mockGetBotHandlers.mockReturnValueOnce({ handleTransaction: mockHandleTransaction })
    const mockNetworkId = 1
    mockGetNetworkId.mockReturnValueOnce(mockNetworkId)
    const mockLog = { some: 'log' }
    const mockReceipt = { blockNumber: 123, transactionHash: mockTxHash, logs: [mockLog] }
    mockGetTransactionReceipt.mockReturnValueOnce(mockReceipt)
    const mockTransaction = { hash: mockTxHash }
    const mockBlock = { hash: '0xabc', transactions: [mockTransaction] }
    mockGetBlockWithTransactions.mockReturnValueOnce(mockBlock)
    const mockTrace = { some: 'trace' }
    mockGetTraceData.mockReturnValueOnce([mockTrace])
    const mockTxEvent = {}
    mockCreateTransactionEvent.mockReturnValueOnce(mockTxEvent)

    await runHandlersOnTransaction(mockTxHash)

    expect(mockGetBotHandlers).toHaveBeenCalledTimes(1)
    expect(mockGetBotHandlers).toHaveBeenCalledWith()
    expect(mockGetNetworkId).toHaveBeenCalledTimes(1)
    expect(mockGetNetworkId).toHaveBeenCalledWith()
    expect(mockGetTransactionReceipt).toHaveBeenCalledTimes(1)
    expect(mockGetTransactionReceipt).toHaveBeenCalledWith(mockTxHash)
    expect(mockGetBlockWithTransactions).toHaveBeenCalledTimes(1)
    expect(mockGetBlockWithTransactions).toHaveBeenCalledWith(mockReceipt.blockNumber)
    expect(mockGetTraceData).toHaveBeenCalledTimes(1)
    expect(mockGetTraceData).toHaveBeenCalledWith(mockReceipt.transactionHash)
    expect(mockCreateTransactionEvent).toHaveBeenCalledTimes(1)
    expect(mockCreateTransactionEvent).toHaveBeenCalledWith(mockTransaction, mockBlock, mockNetworkId, [mockTrace], [mockLog])
    expect(mockHandleTransaction).toHaveBeenCalledTimes(1)
    expect(mockHandleTransaction).toHaveBeenCalledWith(mockTxEvent)
  })

  it("throws an error if more than 10 findings when executing transaction handler", async () => {
    const findings = getFindingsArray(11, 4)

    try {
      const mockHandleTransaction = jest.fn().mockReturnValue(findings)
      mockGetBotHandlers.mockReturnValueOnce({ handleTransaction: mockHandleTransaction })

      mockGetNetworkId.mockReturnValueOnce(1)
      const mockLog = { some: 'log' }
      const mockReceipt = { blockNumber: 123, transactionHash: mockTxHash, logs: [mockLog] }
      mockGetTransactionReceipt.mockReturnValueOnce(mockReceipt)
      const mockTransaction = { hash: mockTxHash }
      const mockBlock = { hash: '0xabc', transactions: [mockTransaction] }
      mockGetBlockWithTransactions.mockReturnValueOnce(mockBlock)
      const mockTrace = { some: 'trace' }
      mockGetTraceData.mockReturnValueOnce([mockTrace])
      const mockTxEvent = {}
      mockCreateTransactionEvent.mockReturnValueOnce(mockTxEvent)

      await runHandlersOnTransaction(mockTxHash)

      fail()
    } catch(err) {
      expect(err.message).toBe(`Cannot return more than 10 findings per request (received ${findings.length})`)
    }
  })

  it("throws an error if more than 50kB of findings found when executing transaction handler", async () => {
    const findings = getFindingsArray(1, 1024 * 50)
    const byteLength = Buffer.byteLength(JSON.stringify(findings));
    try {
      const mockHandleTransaction = jest.fn().mockReturnValue(findings)
      mockGetBotHandlers.mockReturnValueOnce({ handleTransaction: mockHandleTransaction })

      mockGetNetworkId.mockReturnValueOnce(1)
      const mockLog = { some: 'log' }
      const mockReceipt = { blockNumber: 123, transactionHash: mockTxHash, logs: [mockLog] }
      mockGetTransactionReceipt.mockReturnValueOnce(mockReceipt)
      const mockTransaction = { hash: mockTxHash }
      const mockBlock = { hash: '0xabc', transactions: [mockTransaction] }
      mockGetBlockWithTransactions.mockReturnValueOnce(mockBlock)
      const mockTrace = { some: 'trace' }
      mockGetTraceData.mockReturnValueOnce([mockTrace])
      const mockTxEvent = {}
      mockCreateTransactionEvent.mockReturnValueOnce(mockTxEvent)

      await runHandlersOnTransaction(mockTxHash)

      fail()
    } catch(err) {
      expect(err.message).toBe(`Cannot return more than 50kB of findings per request (received ${byteLength} bytes)`)
    }
  })

})

const getFindingsArray = (arraySize: number, sizeInBytes: number) => {
  const finding: Finding = Finding.from( {
    name: "t".repeat(sizeInBytes),
    description: "test description",
    alertId: "1234",
    severity: FindingSeverity.Medium,
    type: FindingType.Exploit
  })

  return (new Array(arraySize)).fill(finding)
}