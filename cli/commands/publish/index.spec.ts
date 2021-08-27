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
    const mockCredentials = { publicKey: "0x123", privateKey: "0x456"}
    mockGetCredentials.mockReturnValueOnce(mockCredentials)
    const mockImageRef = "abc123"
    mockUploadImage.mockReturnValueOnce(mockImageRef)
    const mockManifestRef = "def456"
    mockUploadManifest.mockReturnValueOnce(mockManifestRef)

    await publish({})

    expect(mockGetCredentials).toHaveBeenCalledTimes(1)
    expect(mockGetCredentials).toHaveBeenCalledWith()
    expect(mockGetCredentials).toHaveBeenCalledBefore(mockUploadImage)
    expect(mockUploadImage).toHaveBeenCalledTimes(1)
    expect(mockUploadImage).toHaveBeenCalledWith()
    expect(mockUploadImage).toHaveBeenCalledBefore(mockUploadManifest)
    expect(mockUploadManifest).toHaveBeenCalledTimes(1)
    expect(mockUploadManifest).toHaveBeenCalledWith(mockImageRef, mockCredentials.publicKey, mockCredentials.privateKey)
    expect(mockUploadManifest).toHaveBeenCalledBefore(mockPushToRegistry)
    expect(mockPushToRegistry).toHaveBeenCalledTimes(1)
    expect(mockPushToRegistry).toHaveBeenCalledWith(mockManifestRef, mockCredentials.publicKey, mockCredentials.privateKey)
  })
})