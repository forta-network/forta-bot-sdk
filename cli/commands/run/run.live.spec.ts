import { provideRunLive, RunLive } from "./run.live"

describe("runLive", () => {
  let runLive: RunLive
  const mockEthersProvider = {
    getBlockNumber: jest.fn()
  } as any
  const mockRunHandlersOnBlock = jest.fn()
  const mockShouldContinue = jest.fn()
  const latestBlockNumber = 1000

  const resetMocks = () => {
    mockRunHandlersOnBlock.mockReset()
    mockShouldContinue.mockReset()
    mockEthersProvider.getBlockNumber.mockReset()
  }

  beforeAll(() => {
    runLive = provideRunLive(mockEthersProvider, mockRunHandlersOnBlock, mockShouldContinue)
  })

  beforeEach(() => resetMocks())

  it("runs handlers on latest block and terminates", async () => {
    mockEthersProvider.getBlockNumber.mockReturnValueOnce(latestBlockNumber)
    mockShouldContinue.mockReturnValueOnce(false)

    await runLive()

    expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledTimes(1)
    expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledWith()
    expect(mockRunHandlersOnBlock).toHaveBeenCalledTimes(1)
    expect(mockRunHandlersOnBlock).toHaveBeenCalledWith(latestBlockNumber)
    expect(mockShouldContinue).toHaveBeenCalledTimes(1)
  })

  describe("shouldContinue", async () => {
    it("does nothing if latest block number has not changed", async () => {
      mockEthersProvider.getBlockNumber
        .mockReturnValueOnce(latestBlockNumber)
        .mockReturnValueOnce(latestBlockNumber)
    
      mockShouldContinue
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)

      await runLive()

      expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledTimes(2)
      expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledWith()
      expect(mockRunHandlersOnBlock).toHaveBeenCalledTimes(1)
    })

    it("runs handlers against each block since last processed block", async () => {
      mockEthersProvider.getBlockNumber
        .mockReturnValueOnce(latestBlockNumber)
        .mockReturnValueOnce(latestBlockNumber+3)
      
      mockShouldContinue
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)

      await runLive()

      expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledTimes(2)
      expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledWith()
      expect(mockRunHandlersOnBlock).toHaveBeenCalledTimes(3)
      expect(mockRunHandlersOnBlock).toHaveBeenNthCalledWith(1, latestBlockNumber)
      expect(mockRunHandlersOnBlock).toHaveBeenNthCalledWith(2, latestBlockNumber+1)
      expect(mockRunHandlersOnBlock).toHaveBeenNthCalledWith(3, latestBlockNumber+2)
    })
  })
})