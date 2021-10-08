import { keccak256 } from "../../utils"
import provideUploadManifest, { UploadManifest } from "./upload.manifest"

describe("uploadManifest", () => {
  let uploadManifest: UploadManifest
  const mockWeb3 = {
    eth : { accounts: { sign: jest.fn() } }
  } as any
  const mockFilesystem = {
    existsSync: jest.fn(),
    readFileSync: jest.fn()
  } as any
  const mockAddToIpfs = jest.fn()
  const mockAgentName = "agentName"
  const mockAgentId = "0xagentId"
  const mockVersion = "0.1"
  const mockDocumentation = "README.md"
  const mockImageRef = "123abc"
  const mockPublicKey = "0x123"
  const mockPrivateKey = "0xabc"

  beforeAll(() => {
    uploadManifest = provideUploadManifest(mockWeb3, mockFilesystem, mockAddToIpfs, mockAgentName, mockAgentId, mockVersion, mockDocumentation)
  })

  it("throws error if documentation not found", async () => {
    mockFilesystem.existsSync.mockReturnValueOnce(false)

    try {
      await uploadManifest(mockImageRef, mockPublicKey, mockPrivateKey)
    } catch (e) {
      expect(e.message).toBe(`documentation file ${mockDocumentation} not found`)
    }

    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(1)
    expect(mockFilesystem.existsSync).toHaveBeenCalledWith(mockDocumentation)
  })

  it("uploads signed manifest to ipfs and returns ipfs reference", async () => {
    mockFilesystem.existsSync.mockReset()
    const systemTime = new Date()
    jest.useFakeTimers('modern').setSystemTime(systemTime)
    mockFilesystem.existsSync.mockReturnValueOnce(true)
    const mockDocumentationFile = JSON.stringify({ some: 'documentation' })
    mockFilesystem.readFileSync.mockReturnValueOnce(mockDocumentationFile)
    const mockDocumentationRef = "docRef"
    mockAddToIpfs.mockReturnValueOnce(mockDocumentationRef)
    const mockManifest = {
      from: mockPublicKey,
      name: mockAgentName,
      agentId: mockAgentName,
      agentIdHash: mockAgentId,
      version: mockVersion,
      timestamp: systemTime.toUTCString(),
      imageReference: mockImageRef,
      documentation: mockDocumentationRef
    }
    const mockSignature = "signature"
    mockWeb3.eth.accounts.sign.mockReturnValueOnce({ signature: mockSignature })
    const mockManifestRef = "manifestRef"
    mockAddToIpfs.mockReturnValueOnce(mockManifestRef)

    const manifestRef = await uploadManifest(mockImageRef, mockPublicKey, mockPrivateKey)

    expect(manifestRef).toBe(mockManifestRef)
    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(1)
    expect(mockFilesystem.existsSync).toHaveBeenCalledWith(mockDocumentation)
    expect(mockFilesystem.readFileSync).toHaveBeenCalledTimes(1)
    expect(mockFilesystem.readFileSync).toHaveBeenCalledWith(mockDocumentation, 'utf8')
    expect(mockAddToIpfs).toHaveBeenCalledTimes(2)
    expect(mockAddToIpfs).toHaveBeenNthCalledWith(1, mockDocumentationFile)
    expect(mockWeb3.eth.accounts.sign).toHaveBeenCalledTimes(1)
    expect(mockWeb3.eth.accounts.sign).toHaveBeenCalledWith(JSON.stringify(mockManifest), mockPrivateKey)
    expect(mockAddToIpfs).toHaveBeenNthCalledWith(2, JSON.stringify({ manifest: mockManifest, signature: mockSignature }))
    jest.useRealTimers()
  })
})