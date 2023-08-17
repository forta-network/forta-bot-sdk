import { Finding, FindingSeverity, FindingType } from "../../sdk"
import { provideRunHandlersOnBlock, RunHandlersOnBlock } from "./run.handlers.on.block"

describe("runHandlersOnBlock", () => {
  let runHandlersOnBlock: RunHandlersOnBlock
  const mockGetAgentHandlers = jest.fn()
  const mockGetNetworkId = jest.fn()
  const mockGetBlockWithTransactions = jest.fn()
  const mockGetTraceData = jest.fn().mockReturnValue([])
  const mockGetLogsForBlock = jest.fn().mockReturnValue([])
  const mockCreateBlockEvent = jest.fn()
  const mockCreateTransactionEvent = jest.fn()
  const mockBlockHash = '0xabc'
  const mockTxHash = "0x123"

  beforeAll(() => {
    runHandlersOnBlock = provideRunHandlersOnBlock(
      mockGetAgentHandlers, mockGetNetworkId, mockGetBlockWithTransactions, mockGetTraceData, 
      mockGetLogsForBlock, mockCreateBlockEvent, mockCreateTransactionEvent
    )
  })

  beforeEach(() => {
    mockGetAgentHandlers.mockReset()
    mockGetNetworkId.mockReset()
    mockGetBlockWithTransactions.mockReset()
    mockGetTraceData.mockReset()
    mockGetLogsForBlock.mockReset()
    mockCreateBlockEvent.mockReset()
    mockCreateTransactionEvent.mockReset()
  })

  it("throws an error if no handlers found", async () => {
    mockGetAgentHandlers.mockReturnValueOnce({ })

    try {
      await runHandlersOnBlock(mockBlockHash)
    } catch (e) {
      expect(e.message).toEqual('no block/transaction handler found')
    }

    expect(mockGetAgentHandlers).toHaveBeenCalledTimes(1)
  })

  it("invokes block handlers with block event and transaction handlers with transaction event for each transaction in block", async () => {
    const blockFindings = getFindingsArray(1, 1)
    const txFindings = getFindingsArray(1, 1)
    const mockHandleBlock = jest.fn().mockReturnValue(blockFindings)
    const mockHandleTransaction = jest.fn().mockReturnValue(txFindings)
    mockGetAgentHandlers.mockReturnValue({ handleBlock: mockHandleBlock, handleTransaction: mockHandleTransaction })
    const mockNetworkId = 1
    mockGetNetworkId.mockReturnValue(mockNetworkId)
    const mockTransaction = { hash: mockTxHash }
    const mockBlock = { hash: mockBlockHash, number: 7, transactions: [mockTransaction, mockTransaction] }
    mockGetBlockWithTransactions.mockReturnValue(mockBlock)
    const mockBlockEvent = {}
    mockCreateBlockEvent.mockReturnValue(mockBlockEvent)
    const mockTrace = { transactionHash: mockTxHash, some: 'trace' }
    mockGetTraceData.mockReturnValue([mockTrace])
    const mockLog = { transactionHash: mockTxHash, some: 'log' }
    mockGetLogsForBlock.mockReturnValue([mockLog])
    const mockTxEvent = {}
    mockCreateTransactionEvent.mockReturnValue(mockTxEvent)

    const findings = await runHandlersOnBlock(mockBlockHash)

    expect(findings).toStrictEqual(blockFindings.concat(txFindings).concat(txFindings))
    expect(mockGetAgentHandlers).toHaveBeenCalledTimes(1)
    expect(mockGetAgentHandlers).toHaveBeenCalledWith()
    expect(mockGetNetworkId).toHaveBeenCalledTimes(1)
    expect(mockGetNetworkId).toHaveBeenCalledWith()
    expect(mockGetBlockWithTransactions).toHaveBeenCalledTimes(1)
    expect(mockGetBlockWithTransactions).toHaveBeenCalledWith(mockBlockHash)
    expect(mockCreateBlockEvent).toHaveBeenCalledTimes(1)
    expect(mockCreateBlockEvent).toHaveBeenCalledWith(mockBlock, mockNetworkId)
    expect(mockHandleBlock).toHaveBeenCalledTimes(1)
    expect(mockHandleBlock).toHaveBeenCalledWith(mockBlockEvent)
    expect(mockGetLogsForBlock).toHaveBeenCalledTimes(1)
    expect(mockGetLogsForBlock).toHaveBeenCalledWith(mockBlock.number)
    expect(mockGetTraceData).toHaveBeenCalledTimes(1)
    expect(mockGetTraceData).toHaveBeenCalledWith(mockBlock.number)
    expect(mockCreateTransactionEvent).toHaveBeenCalledTimes(2)
    expect(mockCreateTransactionEvent).toHaveBeenCalledWith(mockTransaction, mockBlock, mockNetworkId, [mockTrace], [mockLog])
    expect(mockHandleTransaction).toHaveBeenCalledTimes(2)
    expect(mockHandleTransaction).toHaveBeenCalledWith(mockTxEvent)

    // if invoked with a network id parameter, should not invoke getNetworkId
    mockGetNetworkId.mockReset()
    await runHandlersOnBlock(mockBlockHash, mockNetworkId)
    expect(mockGetNetworkId).toHaveBeenCalledTimes(0)
  })

  it("throws an error if more than 1000 findings when handling a block", async () => {
    const findings = getFindingsArray(1001, 10)
    try {

      const mockHandleBlock = jest.fn().mockReturnValue(findings)
      mockGetAgentHandlers.mockReturnValueOnce({ handleBlock: mockHandleBlock })

      const mockNetworkId = 1
      mockGetNetworkId.mockReturnValueOnce(mockNetworkId)
      const mockTransaction = { hash: mockTxHash }
      const mockBlock = { hash: mockBlockHash, number: 7, transactions: [mockTransaction] }
      mockGetBlockWithTransactions.mockReturnValueOnce(mockBlock)
      mockCreateBlockEvent.mockReturnValueOnce({})

      await runHandlersOnBlock(mockBlockHash)

      fail()
    } catch(err) {
      expect(err.message).toBe(`Cannot return more than 1000 findings per request (received ${findings.length})`)
    }
  })

  it("throws an error if more than 1000 findings when handling a transaction", async () => {
    const findings = getFindingsArray(1001, 10)
    
    try {
      const mockHandleBlock = jest.fn().mockReturnValue([])
      const mockHandleTransaction = jest.fn().mockReturnValue(findings)
      mockGetAgentHandlers.mockReturnValueOnce({ handleBlock: mockHandleBlock, handleTransaction: mockHandleTransaction })
      const mockNetworkId = 1
      mockGetNetworkId.mockReturnValueOnce(mockNetworkId)
      const mockTransaction = { hash: mockTxHash }
      const mockBlock = { hash: mockBlockHash, number: 7, transactions: [mockTransaction] }
      mockGetBlockWithTransactions.mockReturnValueOnce(mockBlock)
      const mockBlockEvent = {}
      mockCreateBlockEvent.mockReturnValueOnce(mockBlockEvent)
      const mockTrace = { transactionHash: mockTxHash, some: 'trace' }
      mockGetTraceData.mockReturnValueOnce([mockTrace])
      const mockLog = { transactionHash: mockTxHash, some: 'log' }
      mockGetLogsForBlock.mockReturnValueOnce([mockLog])
      const mockTxEvent = {}
      mockCreateTransactionEvent.mockReturnValueOnce(mockTxEvent)

      await runHandlersOnBlock(mockBlockHash)

      fail()
    }catch(err) {
      expect(err.message).toBe(`Cannot return more than 1000 findings per request (received ${findings.length})`)
    }
  })

  it("throws an error if more than 10MB of findings found when handling a block", async () => {
    const findings = getFindingsArray(1, 1024 * 10001)
    const byteLength = Buffer.byteLength(JSON.stringify(findings));
    try {

      const mockHandleBlock = jest.fn().mockReturnValue(findings)
      mockGetAgentHandlers.mockReturnValueOnce({ handleBlock: mockHandleBlock })

      const mockNetworkId = 1
      mockGetNetworkId.mockReturnValueOnce(mockNetworkId)
      const mockTransaction = { hash: mockTxHash }
      const mockBlock = { hash: mockBlockHash, number: 7, transactions: [mockTransaction] }
      mockGetBlockWithTransactions.mockReturnValueOnce(mockBlock)
      mockCreateBlockEvent.mockReturnValueOnce({})

      await runHandlersOnBlock(mockBlockHash)

      fail()
    } catch(err) {
      expect(err.message).toBe(`Cannot return more than 10MB of findings per request (received ${byteLength} bytes)`)
    }
  })

  it("throws an error if more than 10MB of findings found handling a transaction", async () => {

    const findings = getFindingsArray(1, 1024 * 10001)
    const byteLength = Buffer.byteLength(JSON.stringify(findings));
    try {
      const mockHandleBlock = jest.fn().mockReturnValue([])
      const mockHandleTransaction = jest.fn().mockReturnValue(findings)
      mockGetAgentHandlers.mockReturnValueOnce({ handleBlock: mockHandleBlock, handleTransaction: mockHandleTransaction })
      const mockNetworkId = 1
      mockGetNetworkId.mockReturnValueOnce(mockNetworkId)
      const mockTransaction = { hash: mockTxHash }
      const mockBlock = { hash: mockBlockHash, number: 7, transactions: [mockTransaction] }
      mockGetBlockWithTransactions.mockReturnValueOnce(mockBlock)
      const mockBlockEvent = {}
      mockCreateBlockEvent.mockReturnValueOnce(mockBlockEvent)
      const mockTrace = { transactionHash: mockTxHash, some: 'trace' }
      mockGetTraceData.mockReturnValueOnce([mockTrace])
      const mockLog = { transactionHash: mockTxHash, some: 'log' }
      mockGetLogsForBlock.mockReturnValueOnce([mockLog])
      const mockTxEvent = {}
      mockCreateTransactionEvent.mockReturnValueOnce(mockTxEvent)

      await runHandlersOnBlock(mockBlockHash)

      fail()
    }catch(err) {
      expect(err.message).toBe(`Cannot return more than 10MB of findings per request (received ${byteLength} bytes)`)
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
