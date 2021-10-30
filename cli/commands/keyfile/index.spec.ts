import provideKeyfile from "."
import { CommandHandler } from "../.."

describe("keyfile", () => {
  let keyfile: CommandHandler
  const mockGetKeyfile = jest.fn()
  const mockGetJsonFile = jest.fn()

  beforeAll(() => {
    keyfile = provideKeyfile(mockGetKeyfile, mockGetJsonFile)
  })

  it("prints out keyfile path and address", async () => {
    const mockPath = "/some/path/to/keyfile"
    const mockAddress = "0x123"
    mockGetKeyfile.mockReturnValueOnce({ path: mockPath })
    mockGetJsonFile.mockReturnValueOnce({ address: mockAddress })

    await keyfile({})

    expect(mockGetKeyfile).toHaveBeenCalledTimes(1)
    expect(mockGetKeyfile).toHaveBeenCalledWith()
    expect(mockGetJsonFile).toHaveBeenCalledTimes(1)
    expect(mockGetJsonFile).toHaveBeenCalledWith(mockPath)
  })
})