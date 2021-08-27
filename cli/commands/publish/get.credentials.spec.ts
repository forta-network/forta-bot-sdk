import provideGetCredentials, { GetCredentials } from "./get.credentials"

describe("getCredentials", () => {
  let getCredentials: GetCredentials
  const mockShell = {
    ls: jest.fn()
  } as any
  const mockPrompt = jest.fn() as any
  const mockFilesystem = {
    existsSync: jest.fn()
  } as any
  const mockGetKeyfile = jest.fn()
  const mockFortaKeystore = "some/key/store"

  const resetMocks = () => {
    mockFilesystem.existsSync.mockReset()
  }

  beforeAll(() => {
    getCredentials = provideGetCredentials(mockShell, mockPrompt, mockFilesystem, mockGetKeyfile, mockFortaKeystore)
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

  it("returns credentials from keyfile after prompting for password", async () => {
    mockFilesystem.existsSync.mockReturnValueOnce(true)
    const mockKeyfileName = 'mockKeyfile'
    mockShell.ls.mockReturnValueOnce([mockKeyfileName])
    const mockPassword = 'password'
    mockPrompt.mockReturnValueOnce({ password: mockPassword })
    const mockPublicKey = "0x123"
    const mockPrivateKey = "0x456"
    mockGetKeyfile.mockReturnValueOnce({ publicKey: mockPublicKey, privateKey: mockPrivateKey })

    const { publicKey, privateKey } = await getCredentials()

    expect(publicKey).toBe(mockPublicKey)
    expect(privateKey).toBe(mockPrivateKey)
    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(1)
    expect(mockFilesystem.existsSync).toHaveBeenCalledWith(mockFortaKeystore)
    expect(mockShell.ls).toHaveBeenCalledTimes(1)
    expect(mockPrompt).toHaveBeenCalledTimes(1)
    expect(mockPrompt).toHaveBeenCalledWith({
      type: 'password',
      name: 'password',
      message: `Enter password to decrypt keyfile ${mockKeyfileName}`
    })
    expect(mockGetKeyfile).toHaveBeenCalledTimes(1)
    expect(mockGetKeyfile).toHaveBeenCalledWith(mockKeyfileName, mockPassword)
  })
})