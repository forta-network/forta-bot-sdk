import { provideRunFile, RunFile } from "./run.file"

describe("runFile", () => {
  let runFile: RunFile
  const mockGetBotHandlers = jest.fn()
  const mockGetJsonFile = jest.fn()
  const mockFilePath = "some/file/path"

  beforeAll(() => {
    runFile = provideRunFile(mockGetBotHandlers, mockGetJsonFile)
  })

  it("throws error if no handlers found", async () => {
    mockGetBotHandlers.mockReturnValueOnce({})

    try {
      await runFile(mockFilePath)
    } catch (e) {
      expect(e.message).toEqual('no block/transaction handler found')
    }

    expect(mockGetBotHandlers).toHaveBeenCalledTimes(1)
  })

  it("runs handlers against each event provided in file", async () => {
    mockGetBotHandlers.mockReset()
    const mockHandleBlock = jest.fn().mockReturnValue([])
    const mockHandleTransaction = jest.fn().mockReturnValue([])
    mockGetBotHandlers.mockReturnValueOnce({
      handleBlock: mockHandleBlock,
      handleTransaction: mockHandleTransaction
    })
    const blockEvent1 = { "hash": "0xabc" }
    const blockEvent2 = { "hash": "0xdef" }
    const txEvent1 = { transaction: { "hash": "0x123" } }
    const txEvent2 = { transaction: { "hash": "0x456" } }
    mockGetJsonFile.mockReturnValueOnce({
      blockEvents: [blockEvent1, blockEvent2],
      transactionEvents: [txEvent1, txEvent2]
    })

    await runFile(mockFilePath)

    expect(mockGetBotHandlers).toHaveBeenCalledTimes(1)
    expect(mockGetJsonFile).toHaveBeenCalledTimes(1)
    expect(mockGetJsonFile).toHaveBeenCalledWith(mockFilePath)
    expect(mockHandleBlock).toHaveBeenCalledTimes(2)
    expect(mockHandleBlock).toHaveBeenNthCalledWith(1, blockEvent1)
    expect(mockHandleBlock).toHaveBeenNthCalledWith(2, blockEvent2)
    expect(mockHandleTransaction).toHaveBeenCalledTimes(2)
    expect(mockHandleTransaction).toHaveBeenNthCalledWith(1, txEvent1)
    expect(mockHandleTransaction).toHaveBeenNthCalledWith(2, txEvent2)
  })
})