import { provideRunTransaction, RunTransaction } from "./run.transaction"

describe("runTransaction", () => {
  let runTransaction: RunTransaction
  const mockRunHandlersOnTransaction = jest.fn()

  beforeAll(() => {
    runTransaction = provideRunTransaction(mockRunHandlersOnTransaction)
  })

  it("runs handlers on specified transaction", async () => {
    const txHash = "0x123"

    await runTransaction(txHash)

    expect(mockRunHandlersOnTransaction).toHaveBeenCalledTimes(1)
    expect(mockRunHandlersOnTransaction).toHaveBeenCalledWith(txHash)
  })
})