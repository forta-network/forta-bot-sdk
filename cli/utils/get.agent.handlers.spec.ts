import { GetAgentHandlers, provideGetAgentHandlers } from "./get.agent.handlers"

describe("getAgentHandlers", () => {
  let getAgentHandlers: GetAgentHandlers
  const mockAgentPath = "/src/agent"
  const mockPythonAgentPath = "/src/agent.py"
  const mockGetPythonAgentHandlers = jest.fn()
  const mockDynamicImport = jest.fn()
  const mockHandleBlock = jest.fn()
  const mockHandleTransaction = jest.fn()
  const mockHandleAlert = jest.fn()
  const mockInitialize = jest.fn()

  const resetMocks = () => {
    mockGetPythonAgentHandlers.mockReset()
    mockDynamicImport.mockReset()
    mockInitialize.mockReset()
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

  it("imports javascript agent and returns its handlers", async () => {
    const mockInitializeResponse = { some:"response" }
    mockInitialize.mockReturnValue(mockInitializeResponse)
    mockDynamicImport.mockReturnValueOnce({ default: { 
      handleBlock: mockHandleBlock,
      handleTransaction: mockHandleTransaction,
      handleAlert: mockHandleAlert,
      initialize: mockInitialize
    }})
    getAgentHandlers = provideGetAgentHandlers(mockAgentPath, mockGetPythonAgentHandlers, mockDynamicImport)

    const { handleBlock, handleTransaction, handleAlert, initialize, initializeResponse } = await getAgentHandlers()

    expect(handleBlock).toBe(mockHandleBlock)
    expect(handleTransaction).toBe(mockHandleTransaction)
    expect(handleAlert).toBe(mockHandleAlert)
    expect(initialize).toBe(mockInitialize)
    expect(initializeResponse).toBe(mockInitializeResponse)
    expect(mockInitialize).toHaveBeenCalledTimes(1)
    expect(mockDynamicImport).toHaveBeenCalledTimes(1)
    expect(mockDynamicImport).toHaveBeenCalledWith(mockAgentPath)
    expect(mockGetPythonAgentHandlers).toHaveBeenCalledTimes(0)
  })

  it("should not import handlers again if already imported", async () => {
    const { handleBlock, handleTransaction, handleAlert } = await getAgentHandlers()

    expect(handleBlock).toBe(mockHandleBlock)
    expect(handleTransaction).toBe(mockHandleTransaction)
    expect(handleAlert).toBe(mockHandleAlert)
    expect(mockDynamicImport).toHaveBeenCalledTimes(0)
    expect(mockGetPythonAgentHandlers).toHaveBeenCalledTimes(0)
  })

  it("imports python agent and returns its block and transaction handlers", async () => {
    mockGetPythonAgentHandlers.mockReturnValueOnce({
      handleBlock: mockHandleBlock,
      handleTransaction: mockHandleTransaction, handleAlert: mockHandleAlert,
    })
    getAgentHandlers = provideGetAgentHandlers(mockPythonAgentPath, mockGetPythonAgentHandlers, mockDynamicImport)

    const { handleBlock, handleTransaction, handleAlert } = await getAgentHandlers()

    expect(handleBlock).toBe(mockHandleBlock)
    expect(handleTransaction).toBe(mockHandleTransaction)
    expect(handleAlert).toBe(mockHandleAlert)
    expect(mockGetPythonAgentHandlers).toHaveBeenCalledTimes(1)
    expect(mockGetPythonAgentHandlers).toHaveBeenCalledWith(mockPythonAgentPath)
    expect(mockDynamicImport).toHaveBeenCalledTimes(0)
  })
})