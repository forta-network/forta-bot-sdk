import path from 'path'
import provideGetCredentials, { GetCredentials } from "./get.credentials"

describe("getCredentials", () => {
  let getCredentials: GetCredentials
  const mockPrompt = jest.fn() as any
  const mockFilesystem = {
    existsSync: jest.fn()
  } as any
  const mockListKeyfiles = jest.fn()
  const mockGetKeyfile = jest.fn()
  const mockFortaKeystore = "some/key/store"
  const mockKeyfileName = "keyfileName--0xaddress"
  const mockKeyfilePath = path.join(mockFortaKeystore, mockKeyfileName)

  const resetMocks = () => {
    mockFilesystem.existsSync.mockReset()
    mockPrompt.mockReset()
    mockListKeyfiles.mockReset()
    mockGetKeyfile.mockReset()
  }

  beforeAll(() => {
    getCredentials = provideGetCredentials(
      mockPrompt, mockFilesystem, mockListKeyfiles, mockGetKeyfile, mockFortaKeystore, mockKeyfileName)
  })

  beforeEach(() => resetMocks())

  it("throws error if keystore folder does not exist", async () => {
    mockFilesystem.existsSync.mockReturnValueOnce(false)

    try {
      await getCredentials()
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
      await getCredentials()
    } catch (e) {
      expect(e.message).toBe(`keyfile not found at ${mockKeyfilePath}`)
    }

    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(2)
    expect(mockListKeyfiles).toHaveBeenCalledTimes(1)
    expect(mockListKeyfiles).toHaveBeenCalledWith()
    expect(mockFilesystem.existsSync).toHaveBeenNthCalledWith(1, mockFortaKeystore)
    expect(mockFilesystem.existsSync).toHaveBeenNthCalledWith(2, mockKeyfilePath)
  })

  it("returns credentials from specified keyfile after prompting for password", async () => {
    mockFilesystem.existsSync.mockReturnValueOnce(true)
    mockFilesystem.existsSync.mockReturnValueOnce(true)
    const mockPassword = 'password'
    mockPrompt.mockReturnValueOnce({ password: mockPassword })
    const mockPublicKey = "0x123"
    const mockPrivateKey = "0x456"
    mockGetKeyfile.mockReturnValueOnce({ publicKey: mockPublicKey, privateKey: mockPrivateKey })
    mockListKeyfiles.mockReturnValueOnce([mockKeyfileName, "someOther--0xkeyfileaddress"])

    const { publicKey, privateKey } = await getCredentials()

    expect(publicKey).toBe(mockPublicKey)
    expect(privateKey).toBe(mockPrivateKey)
    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(2)
    expect(mockFilesystem.existsSync).toHaveBeenNthCalledWith(1, mockFortaKeystore)
    expect(mockFilesystem.existsSync).toHaveBeenNthCalledWith(2, mockKeyfilePath)
    expect(mockListKeyfiles).toHaveBeenCalledTimes(1)
    expect(mockListKeyfiles).toHaveBeenCalledWith()
    expect(mockPrompt).toHaveBeenCalledTimes(1)
    expect(mockPrompt).toHaveBeenCalledWith({
      type: 'password',
      name: 'password',
      message: `Enter password to decrypt keyfile ${mockKeyfileName}`
    })
    expect(mockGetKeyfile).toHaveBeenCalledTimes(1)
    expect(mockGetKeyfile).toHaveBeenCalledWith(mockKeyfilePath, mockPassword)
  })

  it("returns credentials from some unspecified keyfile after prompting for password", async () => {
    mockFilesystem.existsSync.mockReturnValueOnce(true)
    mockFilesystem.existsSync.mockReturnValueOnce(true)
    const mockKeyfileName2 = 'mockKeyfileName2'
    const mockKeyfilePath2 = path.join(mockFortaKeystore, mockKeyfileName2)
    mockListKeyfiles.mockReturnValueOnce([mockKeyfileName2])
    const mockPassword = 'password'
    mockPrompt.mockReturnValueOnce({ password: mockPassword })
    const mockPublicKey = "0x123"
    const mockPrivateKey = "0x456"
    mockGetKeyfile.mockReturnValueOnce({ publicKey: mockPublicKey, privateKey: mockPrivateKey })

    getCredentials = provideGetCredentials(mockPrompt, mockFilesystem, mockListKeyfiles, mockGetKeyfile, mockFortaKeystore)
    const { publicKey, privateKey } = await getCredentials()

    expect(publicKey).toBe(mockPublicKey)
    expect(privateKey).toBe(mockPrivateKey)
    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(2)
    expect(mockFilesystem.existsSync).toHaveBeenNthCalledWith(1, mockFortaKeystore)
    expect(mockFilesystem.existsSync).toHaveBeenNthCalledWith(2, mockKeyfilePath2)
    expect(mockListKeyfiles).toHaveBeenCalledTimes(1)
    expect(mockListKeyfiles).toHaveBeenCalledWith()
    expect(mockPrompt).toHaveBeenCalledTimes(1)
    expect(mockPrompt).toHaveBeenCalledWith({
      type: 'password',
      name: 'password',
      message: `Enter password to decrypt keyfile ${mockKeyfileName2}`
    })
    expect(mockGetKeyfile).toHaveBeenCalledTimes(1)
    expect(mockGetKeyfile).toHaveBeenCalledWith(mockKeyfilePath2, mockPassword)
  })
})