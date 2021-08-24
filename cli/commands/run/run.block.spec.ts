import { provideRunBlock, RunBlock } from "./run.block"

describe("runBlock", () => {
  let runBlock: RunBlock
  const mockRunHandlersOnBlock = jest.fn()

  beforeAll(() => {
    runBlock = provideRunBlock(mockRunHandlersOnBlock)
  })

  it("runs handlers on specified block", async () => {
    const blockHash = "0xabc"

    await runBlock(blockHash)

    expect(mockRunHandlersOnBlock).toHaveBeenCalledTimes(1)
    expect(mockRunHandlersOnBlock).toHaveBeenCalledWith(blockHash)
  })
})