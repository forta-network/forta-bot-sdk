import path from 'path'
import provideGetCredentials, { GetCredentials } from "./get.credentials"

describe("getCredentials", () => {
  let getCredentials: GetCredentials
  const mockPrompt = jest.fn() as any
  const mockGetKeyfile = jest.fn()
  const mockDecryptKeyfile = jest.fn()

  const resetMocks = () => {
    mockPrompt.mockReset()
    mockGetKeyfile.mockReset()
    mockDecryptKeyfile.mockReset()
  }

  beforeAll(() => {
    getCredentials = provideGetCredentials(mockPrompt, mockGetKeyfile, mockDecryptKeyfile)
  })

  beforeEach(() => resetMocks())

  it("returns credentials from keyfile after prompting for password", async () => {
    const mockFortaKeystore = "some/key/store"
    const mockKeyfileName = "keyfileName--0xaddress"
    const mockKeyfilePath = path.join(mockFortaKeystore, mockKeyfileName)
    mockGetKeyfile.mockReturnValueOnce({ path: mockKeyfilePath, name: mockKeyfileName })
    const mockPassword = 'password'
    mockPrompt.mockReturnValueOnce({ password: mockPassword })
    const mockPublicKey = "0x123"
    const mockPrivateKey = "0x456"
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