import path from 'path'
import provideGetKeyfile, { GetKeyfile } from "./get.keyfile"

describe("getKeyfile", () => {
  let getKeyfile: GetKeyfile
  const mockListKeyfiles = jest.fn()
  const mockFilesystem = {
    existsSync: jest.fn()
  } as any
  const mockFortaKeystore = "/path/to/keystore"
  const mockKeyfileName = "UTC--1234--5678abcd"
  const mockKeyfilePath = path.join(mockFortaKeystore, mockKeyfileName)

  const resetMocks = () => {
    mockFilesystem.existsSync.mockReset()
    mockListKeyfiles.mockReset()
  }

  beforeAll(() => {
    getKeyfile = provideGetKeyfile(mockListKeyfiles, mockFilesystem, mockFortaKeystore, mockKeyfileName)
  })

  beforeEach(() => resetMocks())

  it("throws error if keystore folder does not exist", async () => {
    mockFilesystem.existsSync.mockReturnValueOnce(false)

    try {
      await getKeyfile()
    } catch (e) {
      expect(e.message).toBe(`keystore folder ${mockFortaKeystore} not found`)
    }

    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(1)
    expect(mockFilesystem.existsSync).toHaveBeenCalledWith(mockFortaKeystore)
  })


  it("throws error if keyfile path does not exist", async () => {
    mockFilesystem.existsSync.mockReturnValueOnce(true)
    mockFilesystem.existsSync.mockReturnValueOnce(false)
    mockListKeyfiles.mockReturnValueOnce([mockKeyfileName])

    try {
      await getKeyfile()
    } catch (e) {
      expect(e.message).toBe(`keyfile not found at ${mockKeyfilePath}`)
    }

    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(2)
    expect(mockListKeyfiles).toHaveBeenCalledTimes(1)
    expect(mockListKeyfiles).toHaveBeenCalledWith()
    expect(mockFilesystem.existsSync).toHaveBeenNthCalledWith(1, mockFortaKeystore)
    expect(mockFilesystem.existsSync).toHaveBeenNthCalledWith(2, mockKeyfilePath)
  })

  it("returns keyfile if specified in config", async () => {
    mockFilesystem.existsSync.mockReturnValueOnce(true)
    mockFilesystem.existsSync.mockReturnValueOnce(true)
    const mockKeyfileName2 = "UTC--1234--9101xyzw"
    mockListKeyfiles.mockReturnValueOnce([mockKeyfileName2, mockKeyfileName])

    const { path: keyfilePath, name } = await getKeyfile()

    expect(keyfilePath).toEqual(mockKeyfilePath)
    expect(name).toEqual(mockKeyfileName)
    expect(mockListKeyfiles).toHaveBeenCalledTimes(1)
    expect(mockListKeyfiles).toHaveBeenCalledWith()
    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(2)
    expect(mockFilesystem.existsSync).toHaveBeenNthCalledWith(1, mockFortaKeystore)
    expect(mockFilesystem.existsSync).toHaveBeenNthCalledWith(2, mockKeyfilePath)
  })

  it("returns first keyfile if none specified in config", async () => {
    mockFilesystem.existsSync.mockReturnValueOnce(true)
    mockFilesystem.existsSync.mockReturnValueOnce(true)
    const mockKeyfileName2 = "UTC--1234--9101xyzw"
    mockListKeyfiles.mockReturnValueOnce([mockKeyfileName, mockKeyfileName2])

    getKeyfile = provideGetKeyfile(mockListKeyfiles, mockFilesystem, mockFortaKeystore)
    const { path: keyfilePath, name } = await getKeyfile()

    expect(keyfilePath).toEqual(mockKeyfilePath)
    expect(name).toEqual(mockKeyfileName)
    expect(mockListKeyfiles).toHaveBeenCalledTimes(1)
    expect(mockListKeyfiles).toHaveBeenCalledWith()
    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(2)
    expect(mockFilesystem.existsSync).toHaveBeenNthCalledWith(1, mockFortaKeystore)
    expect(mockFilesystem.existsSync).toHaveBeenNthCalledWith(2, mockKeyfilePath)
  })
})