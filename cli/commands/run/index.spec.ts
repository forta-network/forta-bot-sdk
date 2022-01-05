import provideRun from "."
import { CommandHandler } from "../.."

describe("run", () => {
  let run: CommandHandler
  const mockContainer = {
    resolve: jest.fn()
  } as any
  const mockCache = {
    save: jest.fn()
  } as any
  const mockExit = jest.spyOn(process, 'exit').mockImplementation();

  const resetMocks = () => {
    mockContainer.resolve.mockReset()
    mockCache.save.mockReset()
    mockExit.mockReset()
  }

  beforeAll(() => {
    run = provideRun(mockContainer, mockCache)
  })

  beforeEach(() => resetMocks())

  it("invokes runTransaction if --tx argument is provided", async () => {
    const mockCliArgs = {tx: '0x123'}
    const mockRunTransaction = jest.fn()
    mockContainer.resolve.mockReturnValueOnce(mockRunTransaction)

    await run(mockCliArgs)

    expect(mockContainer.resolve).toHaveBeenCalledTimes(1)
    expect(mockContainer.resolve).toHaveBeenCalledWith("runTransaction")
    expect(mockRunTransaction).toHaveBeenCalledTimes(1)
    expect(mockRunTransaction).toHaveBeenCalledWith(mockCliArgs.tx)
    expect(mockCache.save).toHaveBeenCalledTimes(1)
    expect(mockCache.save).toHaveBeenCalledWith(true)
    expect(mockExit).toHaveBeenCalledTimes(1)
  })

  it("invokes runBlock if --block argument is provided", async () => {
    const mockCliArgs = {block: '0xabc'}
    const mockRunBlock = jest.fn()
    mockContainer.resolve.mockReturnValueOnce(mockRunBlock)

    await run(mockCliArgs)

    expect(mockContainer.resolve).toHaveBeenCalledTimes(1)
    expect(mockContainer.resolve).toHaveBeenCalledWith("runBlock")
    expect(mockRunBlock).toHaveBeenCalledTimes(1)
    expect(mockRunBlock).toHaveBeenCalledWith(mockCliArgs.block)
    expect(mockCache.save).toHaveBeenCalledTimes(1)
    expect(mockCache.save).toHaveBeenCalledWith(true)
    expect(mockExit).toHaveBeenCalledTimes(1)
  })

  it("invokes runBlockRange if --range argument is provided", async () => {
    const mockCliArgs = {range: '1..2'}
    const mockRunBlockRange = jest.fn()
    mockContainer.resolve.mockReturnValueOnce(mockRunBlockRange)

    await run(mockCliArgs)

    expect(mockContainer.resolve).toHaveBeenCalledTimes(1)
    expect(mockContainer.resolve).toHaveBeenCalledWith("runBlockRange")
    expect(mockRunBlockRange).toHaveBeenCalledTimes(1)
    expect(mockRunBlockRange).toHaveBeenCalledWith(mockCliArgs.range)
    expect(mockCache.save).toHaveBeenCalledTimes(1)
    expect(mockCache.save).toHaveBeenCalledWith(true)
    expect(mockExit).toHaveBeenCalledTimes(1)
  })

  it("invokes runFile if --file argument is provided", async () => {
    const mockCliArgs = {file: 'someFile.json'}
    const mockRunFile = jest.fn()
    mockContainer.resolve.mockReturnValueOnce(mockRunFile)

    await run(mockCliArgs)

    expect(mockContainer.resolve).toHaveBeenCalledTimes(1)
    expect(mockContainer.resolve).toHaveBeenCalledWith("runFile")
    expect(mockRunFile).toHaveBeenCalledTimes(1)
    expect(mockRunFile).toHaveBeenCalledWith(mockCliArgs.file)
    expect(mockCache.save).toHaveBeenCalledTimes(1)
    expect(mockCache.save).toHaveBeenCalledWith(true)
    expect(mockExit).toHaveBeenCalledTimes(1)
  })

  it("invokes runProdServer if --prod argument is provided", async () => {
    const mockCliArgs = {prod: true}
    const mockRunProdServer = jest.fn()
    mockContainer.resolve.mockReturnValueOnce(mockRunProdServer)

    await run(mockCliArgs)

    expect(mockContainer.resolve).toHaveBeenCalledTimes(1)
    expect(mockContainer.resolve).toHaveBeenCalledWith("runProdServer")
    expect(mockRunProdServer).toHaveBeenCalledTimes(1)
    expect(mockRunProdServer).toHaveBeenCalledWith()
    expect(mockCache.save).toHaveBeenCalledTimes(1)
    expect(mockCache.save).toHaveBeenCalledWith(true)
    expect(mockExit).toHaveBeenCalledTimes(0)
  })

  it("invokes runLive if no argument is provided", async () => {
    const mockCliArgs = {}
    const mockRunLive = jest.fn()
    mockContainer.resolve.mockReturnValueOnce(mockRunLive)

    await run(mockCliArgs)

    expect(mockContainer.resolve).toHaveBeenCalledTimes(1)
    expect(mockContainer.resolve).toHaveBeenCalledWith("runLive")
    expect(mockRunLive).toHaveBeenCalledTimes(1)
    expect(mockRunLive).toHaveBeenCalledWith()
    expect(mockCache.save).toHaveBeenCalledTimes(1)
    expect(mockCache.save).toHaveBeenCalledWith(true)
    expect(mockExit).toHaveBeenCalledTimes(0)
  })
})