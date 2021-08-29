import { provideRunBlockRange, RunBlockRange } from "./run.block.range"

describe("runBlockRange", () => {
  let runBlockRange: RunBlockRange
  const mockRunHandlersOnBlock = jest.fn()

  beforeAll(() => {
    runBlockRange = provideRunBlockRange(mockRunHandlersOnBlock)
  })

  it("throws error if end block is not greater than start block", async () => {
    try {
      await runBlockRange("1..1")
    } catch (e) {
      expect(e.message).toEqual('end block must be greater than start block')
    }

    expect(mockRunHandlersOnBlock).toHaveBeenCalledTimes(0)
  })

  it("runs handlers on each block provided in the range", async () => {
    mockRunHandlersOnBlock.mockReset()

    await runBlockRange("1..3")

    expect(mockRunHandlersOnBlock).toHaveBeenCalledTimes(3)
    expect(mockRunHandlersOnBlock).toHaveBeenNthCalledWith(1, 1)
    expect(mockRunHandlersOnBlock).toHaveBeenNthCalledWith(2, 2)
    expect(mockRunHandlersOnBlock).toHaveBeenNthCalledWith(3, 3)
  })
})