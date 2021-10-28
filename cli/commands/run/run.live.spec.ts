import { provideRunLive, RunLive } from "./run.live"

describe("runLive", () => {
  let runLive: RunLive
  const mockEthersProvider = {
    getBlockNumber: jest.fn()
  } as any
  const mockRunHandlersOnBlock = jest.fn()
  const mockSetInterval = jest.fn()
  const latestBlockNumber = 1000
  let callback: () => Promise<void>

  const resetMocks = () => {
    mockRunHandlersOnBlock.mockReset()
    mockEthersProvider.getBlockNumber.mockReset()
  }

  beforeAll(() => {
    runLive = provideRunLive(mockEthersProvider, mockRunHandlersOnBlock, mockSetInterval)
  })

  beforeEach(() => resetMocks())

  it("runs handlers on latest block and then schedules callback every 15s", async () => {
    mockEthersProvider.getBlockNumber.mockReturnValueOnce(latestBlockNumber)

    await runLive()

    expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledTimes(1)
    expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledWith()
    expect(mockRunHandlersOnBlock).toHaveBeenCalledTimes(1)
    expect(mockRunHandlersOnBlock).toHaveBeenCalledWith(latestBlockNumber)
    expect(mockSetInterval).toHaveBeenCalledTimes(1)
    callback = mockSetInterval.mock.calls[0][0]
    const interval = mockSetInterval.mock.calls[0][1]
    expect(interval).toBe(15000)
  })

  describe("callback", () => {
    it("does nothing if latest block number has not changed", async () => {
      mockEthersProvider.getBlockNumber.mockReturnValueOnce(latestBlockNumber)

      await callback()

      expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledTimes(1)
      expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledWith()
      expect(mockRunHandlersOnBlock).toHaveBeenCalledTimes(0)
    })

    it("runs handlers against each block since last processed block", async () => {
      mockEthersProvider.getBlockNumber.mockReturnValueOnce(latestBlockNumber+3)

      await callback()

      expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledTimes(1)
      expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledWith()
      expect(mockRunHandlersOnBlock).toHaveBeenCalledTimes(3)
      expect(mockRunHandlersOnBlock).toHaveBeenNthCalledWith(1, latestBlockNumber+1)
      expect(mockRunHandlersOnBlock).toHaveBeenNthCalledWith(2, latestBlockNumber+2)
      expect(mockRunHandlersOnBlock).toHaveBeenNthCalledWith(3, latestBlockNumber+3)
    })
  })
})