import providePublish from "."
import { CommandHandler } from "../.."

describe("publish", () => {
  let publish: CommandHandler
  const mockGetCredentials = jest.fn()
  const mockUploadImage = jest.fn()
  const mockUploadManifest = jest.fn()
  const mockPushToRegistry = jest.fn()

  beforeAll(() => {
    publish = providePublish(mockGetCredentials, mockUploadImage, mockUploadManifest, mockPushToRegistry)
  })

  it("publishes the agent correctly", async () => {
    const mockPrivateKey = "0x456"
    mockGetCredentials.mockReturnValueOnce({ privateKey: mockPrivateKey})
    const mockImageRef = "abc123"
    mockUploadImage.mockReturnValueOnce(mockImageRef)
    const mockManifestRef = "def456"
    mockUploadManifest.mockReturnValueOnce(mockManifestRef)

    await publish({})

    expect(mockUploadImage).toHaveBeenCalledTimes(1)
    expect(mockUploadImage).toHaveBeenCalledWith()
    expect(mockUploadImage).toHaveBeenCalledBefore(mockGetCredentials)
    expect(mockGetCredentials).toHaveBeenCalledTimes(1)
    expect(mockGetCredentials).toHaveBeenCalledWith()
    expect(mockGetCredentials).toHaveBeenCalledBefore(mockUploadManifest)
    expect(mockUploadManifest).toHaveBeenCalledTimes(1)
    expect(mockUploadManifest).toHaveBeenCalledWith(mockImageRef, mockPrivateKey)
    expect(mockUploadManifest).toHaveBeenCalledBefore(mockPushToRegistry)
    expect(mockPushToRegistry).toHaveBeenCalledTimes(1)
    expect(mockPushToRegistry).toHaveBeenCalledWith(mockManifestRef, mockPrivateKey)
  })
})