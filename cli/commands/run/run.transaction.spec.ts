import { provideRunTransaction, RunTransaction } from "./run.transaction"

describe("runTransaction", () => {
  let runTransaction: RunTransaction
  const mockRunHandlersOnTransaction = jest.fn()

  beforeEach(() => {
    mockRunHandlersOnTransaction.mockReset()
  })

  beforeAll(() => {
    runTransaction = provideRunTransaction(mockRunHandlersOnTransaction)
  })

  it("runs handlers on specified transaction", async () => {
    const txHash = "0x123"

    await runTransaction(txHash)

    expect(mockRunHandlersOnTransaction).toHaveBeenCalledTimes(1)
    expect(mockRunHandlersOnTransaction).toHaveBeenCalledWith(txHash)
  })

  it("runs handlers on multiple specified transactions", async () => {
    const txHashes = "0x123,0x456"

    await runTransaction(txHashes)

    expect(mockRunHandlersOnTransaction).toHaveBeenCalledTimes(2)
    expect(mockRunHandlersOnTransaction).toHaveBeenNthCalledWith(1, "0x123")
    expect(mockRunHandlersOnTransaction).toHaveBeenNthCalledWith(2, "0x456")
  })
})