import { provideRunBlock, RunBlock } from "./run.block"

describe("runBlock", () => {
  let runBlock: RunBlock
  const mockRunHandlersOnBlock = jest.fn()

  beforeEach(() => {
    mockRunHandlersOnBlock.mockReset()
  })

  beforeAll(() => {
    runBlock = provideRunBlock(mockRunHandlersOnBlock)
  })

  it("runs handlers on specified block", async () => {
    const blockHash = "0xabc"

    await runBlock(blockHash)

    expect(mockRunHandlersOnBlock).toHaveBeenCalledTimes(1)
    expect(mockRunHandlersOnBlock).toHaveBeenCalledWith(blockHash)
  })

  it("runs handlers on multiple specified blocks", async () => {
    const blockHashes = "0xabc,0xdef"

    await runBlock(blockHashes)

    expect(mockRunHandlersOnBlock).toHaveBeenCalledTimes(2)
    expect(mockRunHandlersOnBlock).toHaveBeenNthCalledWith(1, "0xabc")
    expect(mockRunHandlersOnBlock).toHaveBeenNthCalledWith(2, "0xdef")
  })
})