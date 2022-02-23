import path from 'path'
import provideGetCredentials, { GetCredentials } from "./get.credentials"

describe("getCredentials", () => {
  let getCredentials: GetCredentials
  const mockPrompt = jest.fn() as any
  const mockGetKeyfile = jest.fn()
  const mockDecryptKeyfile = jest.fn()
  const mockFortaKeystore = "some/key/store"
  const mockKeyfileName = "keyfileName--0xaddress"
  const mockKeyfilePath = path.join(mockFortaKeystore, mockKeyfileName)
  const mockPublicKey = "0x123"
  const mockPrivateKey = "0x456"

  const resetMocks = () => {
    mockPrompt.mockReset()
    mockGetKeyfile.mockReset()
    mockDecryptKeyfile.mockReset()
  }

  beforeEach(() => resetMocks())

  it("if password specified in config, returns credentials from keyfile without prompting for password", async () => {
    const mockKeyfilePassword = "keyfilePassword"
    getCredentials = provideGetCredentials(mockPrompt, mockGetKeyfile, mockDecryptKeyfile, mockKeyfilePassword)
    mockGetKeyfile.mockReturnValueOnce({ path: mockKeyfilePath, name: mockKeyfileName })
    mockDecryptKeyfile.mockReturnValueOnce({ publicKey: mockPublicKey, privateKey: mockPrivateKey })

    const { publicKey, privateKey } = await getCredentials()

    expect(publicKey).toBe(mockPublicKey)
    expect(privateKey).toBe(mockPrivateKey)
    expect(mockGetKeyfile).toHaveBeenCalledTimes(1)
    expect(mockGetKeyfile).toHaveBeenCalledWith()
    expect(mockPrompt).toHaveBeenCalledTimes(0)
    expect(mockDecryptKeyfile).toHaveBeenCalledTimes(1)
    expect(mockDecryptKeyfile).toHaveBeenCalledWith(mockKeyfilePath, mockKeyfilePassword)
  })

  it("if password not specified in config, returns credentials from keyfile after prompting for password", async () => {
    getCredentials = provideGetCredentials(mockPrompt, mockGetKeyfile, mockDecryptKeyfile)
    mockGetKeyfile.mockReturnValueOnce({ path: mockKeyfilePath, name: mockKeyfileName })
    const mockPassword = 'password'
    mockPrompt.mockReturnValueOnce({ password: mockPassword })
    mockDecryptKeyfile.mockReturnValueOnce({ publicKey: mockPublicKey, privateKey: mockPrivateKey })

    const { publicKey, privateKey } = await getCredentials()

    expect(publicKey).toBe(mockPublicKey)
    expect(privateKey).toBe(mockPrivateKey)
    expect(mockGetKeyfile).toHaveBeenCalledTimes(1)
    expect(mockGetKeyfile).toHaveBeenCalledWith()
    expect(mockPrompt).toHaveBeenCalledTimes(1)
    expect(mockPrompt).toHaveBeenCalledWith({
      type: 'password',
      name: 'password',
      message: `Enter password to decrypt keyfile ${mockKeyfileName}`
    })
    expect(mockDecryptKeyfile).toHaveBeenCalledTimes(1)
    expect(mockDecryptKeyfile).toHaveBeenCalledWith(mockKeyfilePath, mockPassword)
  })
})