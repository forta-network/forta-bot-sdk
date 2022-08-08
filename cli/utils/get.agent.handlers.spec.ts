import { GetBotHandlers, provideGetBotHandlers } from "./get.agent.handlers"

describe("getBotHandlers", () => {
  let getBotHandlers: GetBotHandlers
  const mockBotPath = "/src/agent"
  const mockPythonBotPath = "/src/agent.py"
  const mockGetPythonBotHandlers = jest.fn()
  const mockDynamicImport = jest.fn()
  const mockHandleBlock = jest.fn()
  const mockHandleTransaction = jest.fn()

  const resetMocks = () => {
    mockGetPythonBotHandlers.mockReset()
    mockDynamicImport.mockReset()
  }

  beforeEach(() => {
    resetMocks()
  })

  it("throws error if unable to load agent", async () => {
    const mockErrMsg = 'some error'
    mockDynamicImport.mockRejectedValueOnce(new Error(mockErrMsg))
    getBotHandlers = provideGetBotHandlers(mockBotPath, mockGetPythonBotHandlers, mockDynamicImport)

    try {
      await getBotHandlers()
    } catch (e) {
      expect(e.message).toEqual(`issue getting bot handlers: ${mockErrMsg}`)
    }

    expect(mockDynamicImport).toHaveBeenCalledTimes(1)
  })

  it("imports javascript agent and returns its block and transaction handlers", async () => {
    mockDynamicImport.mockReturnValueOnce({ default: { 
      handleBlock: mockHandleBlock,
      handleTransaction: mockHandleTransaction
    }})
    getBotHandlers = provideGetBotHandlers(mockBotPath, mockGetPythonBotHandlers, mockDynamicImport)

    const { handleBlock, handleTransaction } = await getBotHandlers()

    expect(handleBlock).toBe(mockHandleBlock)
    expect(handleTransaction).toBe(mockHandleTransaction)
    expect(mockDynamicImport).toHaveBeenCalledTimes(1)
    expect(mockDynamicImport).toHaveBeenCalledWith(mockBotPath)
    expect(mockGetPythonBotHandlers).toHaveBeenCalledTimes(0)
  })

  it("should not import handlers again if already imported", async () => {
    const { handleBlock, handleTransaction } = await getBotHandlers()

    expect(handleBlock).toBe(mockHandleBlock)
    expect(handleTransaction).toBe(mockHandleTransaction)
    expect(mockDynamicImport).toHaveBeenCalledTimes(0)
    expect(mockGetPythonBotHandlers).toHaveBeenCalledTimes(0)
  })

  it("imports python agent and returns its block and transaction handlers", async () => {
    mockGetPythonBotHandlers.mockReturnValueOnce({
      handleBlock: mockHandleBlock,
      handleTransaction: mockHandleTransaction
    })
    getBotHandlers = provideGetBotHandlers(mockPythonBotPath, mockGetPythonBotHandlers, mockDynamicImport)

    const { handleBlock, handleTransaction } = await getBotHandlers()

    expect(handleBlock).toBe(mockHandleBlock)
    expect(handleTransaction).toBe(mockHandleTransaction)
    expect(mockGetPythonBotHandlers).toHaveBeenCalledTimes(1)
    expect(mockGetPythonBotHandlers).toHaveBeenCalledWith(mockPythonBotPath)
    expect(mockDynamicImport).toHaveBeenCalledTimes(0)
  })
})