import { GetAgentHandlers, provideGetAgentHandlers } from "./get.agent.handlers"

describe("getAgentHandlers", () => {
  let getAgentHandlers: GetAgentHandlers
  const mockAgentPath = "/src/agent"
  const mockPythonAgentPath = "/src/agent.py"
  const mockGetPythonAgentHandlers = jest.fn()
  const mockDynamicImport = jest.fn()
  const mockHandleBlock = jest.fn()
  const mockHandleTransaction = jest.fn()

  const resetMocks = () => {
    mockGetPythonAgentHandlers.mockReset()
    mockDynamicImport.mockReset()
  }

  beforeEach(() => {
    resetMocks()
  })

  it("throws error if unable to load agent", async () => {
    const mockErrMsg = 'some error'
    mockDynamicImport.mockRejectedValueOnce(new Error(mockErrMsg))
    getAgentHandlers = provideGetAgentHandlers(mockAgentPath, mockGetPythonAgentHandlers, mockDynamicImport)

    try {
      await getAgentHandlers()
    } catch (e) {
      expect(e.message).toEqual(`issue getting agent handlers: ${mockErrMsg}`)
    }

    expect(mockDynamicImport).toHaveBeenCalledTimes(1)
  })

  it("imports javascript agent and returns its block and transaction handlers", async () => {
    mockDynamicImport.mockReturnValueOnce({ default: { 
      handleBlock: mockHandleBlock,
      handleTransaction: mockHandleTransaction
    }})
    getAgentHandlers = provideGetAgentHandlers(mockAgentPath, mockGetPythonAgentHandlers, mockDynamicImport)

    const { handleBlock, handleTransaction } = await getAgentHandlers()

    expect(handleBlock).toBe(mockHandleBlock)
    expect(handleTransaction).toBe(mockHandleTransaction)
    expect(mockDynamicImport).toHaveBeenCalledTimes(1)
    expect(mockDynamicImport).toHaveBeenCalledWith(mockAgentPath)
    expect(mockGetPythonAgentHandlers).toHaveBeenCalledTimes(0)
  })

  it("should not import handlers again if already imported", async () => {
    const { handleBlock, handleTransaction } = await getAgentHandlers()

    expect(handleBlock).toBe(mockHandleBlock)
    expect(handleTransaction).toBe(mockHandleTransaction)
    expect(mockDynamicImport).toHaveBeenCalledTimes(0)
    expect(mockGetPythonAgentHandlers).toHaveBeenCalledTimes(0)
  })

  it("imports python agent and returns its block and transaction handlers", async () => {
    mockGetPythonAgentHandlers.mockReturnValueOnce({
      handleBlock: mockHandleBlock,
      handleTransaction: mockHandleTransaction
    })
    getAgentHandlers = provideGetAgentHandlers(mockPythonAgentPath, mockGetPythonAgentHandlers, mockDynamicImport)

    const { handleBlock, handleTransaction } = await getAgentHandlers()

    expect(handleBlock).toBe(mockHandleBlock)
    expect(handleTransaction).toBe(mockHandleTransaction)
    expect(mockGetPythonAgentHandlers).toHaveBeenCalledTimes(1)
    expect(mockGetPythonAgentHandlers).toHaveBeenCalledWith(mockPythonAgentPath)
    expect(mockDynamicImport).toHaveBeenCalledTimes(0)
  })
})