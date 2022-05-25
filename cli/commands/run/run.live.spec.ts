import { provideRunLive, RunLive } from "./run.live"

describe("runLive", () => {
  let runLive: RunLive
  const mockEthersProvider = {
    getBlockNumber: jest.fn(),
    getNetwork: jest.fn()
  } as any
  const mockRunHandlersOnBlock = jest.fn()
  const mockSleep = jest.fn()
  const mockShouldContinuePolling = jest.fn()
  const latestBlockNumber = 1000

  const resetMocks = () => {
    mockRunHandlersOnBlock.mockReset()
    mockEthersProvider.getBlockNumber.mockReset()
    mockEthersProvider.getNetwork.mockReset()
    mockSleep.mockReset()
    mockShouldContinuePolling.mockReset()
  }

  const blockChainNetwork = { chainId: 1 }

  beforeAll(() => {
    runLive = provideRunLive(mockEthersProvider, mockRunHandlersOnBlock, mockSleep)
  })

  beforeEach(() => resetMocks())

  it("processes latest block on first iteration", async () => {
    mockShouldContinuePolling.mockReturnValueOnce(true).mockReturnValueOnce(false)
    mockEthersProvider.getBlockNumber.mockReturnValueOnce(latestBlockNumber)
    mockEthersProvider.getNetwork.mockReturnValueOnce(blockChainNetwork)

    await runLive(mockShouldContinuePolling)

    expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledTimes(1)
    expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledWith()
    expect(mockRunHandlersOnBlock).toHaveBeenCalledTimes(1)
    expect(mockRunHandlersOnBlock).toHaveBeenCalledWith(latestBlockNumber)
    expect(mockSleep).toHaveBeenCalledTimes(0)
  })

  it("processes new blocks on following iterations", async () => {
    mockShouldContinuePolling.mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(false)
    mockEthersProvider.getBlockNumber.mockReturnValueOnce(latestBlockNumber).mockReturnValueOnce(latestBlockNumber+3)
    mockEthersProvider.getNetwork.mockReturnValueOnce(blockChainNetwork)

    await runLive(mockShouldContinuePolling)

    expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledTimes(2)
    expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledWith()
    expect(mockRunHandlersOnBlock).toHaveBeenCalledTimes(4)
    expect(mockRunHandlersOnBlock).toHaveBeenCalledWith(latestBlockNumber)
    expect(mockRunHandlersOnBlock).toHaveBeenCalledWith(latestBlockNumber+1)
    expect(mockRunHandlersOnBlock).toHaveBeenCalledWith(latestBlockNumber+2)
    expect(mockRunHandlersOnBlock).toHaveBeenCalledWith(latestBlockNumber+3)
    expect(mockSleep).toHaveBeenCalledTimes(0)
  })

  it("waits if there are no new blocks", async () => {
    mockShouldContinuePolling.mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(false)
    mockEthersProvider.getBlockNumber.mockReturnValueOnce(latestBlockNumber).mockReturnValueOnce(latestBlockNumber)
    mockEthersProvider.getNetwork.mockReturnValueOnce(blockChainNetwork)

    await runLive(mockShouldContinuePolling)

    expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledTimes(2)
    expect(mockEthersProvider.getBlockNumber).toHaveBeenCalledWith()
    expect(mockRunHandlersOnBlock).toHaveBeenCalledTimes(1)
    expect(mockRunHandlersOnBlock).toHaveBeenCalledWith(latestBlockNumber)
    expect(mockSleep).toHaveBeenCalledTimes(1)
    expect(mockSleep).toHaveBeenCalledWith(15000)
  })
})