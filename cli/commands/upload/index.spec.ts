
import provideUpload from "."

describe("upload", () => {
  it("uploads a bot image and a bot manifest and prints out the reference with a message", async () => {
    const mockGetCredentials = jest.fn()
    const mockUploadImage = jest.fn()
    const mockUploadManifest = jest.fn()
    const mockAppendToFile = jest.fn()

    const mockPrivateKey = "0x4567"
    mockGetCredentials.mockReturnValueOnce({ privateKey: mockPrivateKey})
    const systemTime = new Date()
    jest.useFakeTimers('modern').setSystemTime(systemTime)
    const mockImageRef = "abc123"
    mockUploadImage.mockReturnValueOnce(mockImageRef)
    const mockManifestRef = "def456"
    mockUploadManifest.mockReturnValueOnce(mockManifestRef)
    const mockCliArgs = {}

    const push = provideUpload(mockGetCredentials, mockUploadImage, mockUploadManifest, mockAppendToFile, mockCliArgs)
    await push()

    expect(mockUploadImage).toHaveBeenCalledTimes(1)
    expect(mockUploadImage).toHaveBeenCalledWith()
    expect(mockUploadImage).toHaveBeenCalledBefore(mockGetCredentials)
    expect(mockGetCredentials).toHaveBeenCalledTimes(1)
    expect(mockGetCredentials).toHaveBeenCalledWith()
    expect(mockGetCredentials).toHaveBeenCalledBefore(mockUploadManifest)
    expect(mockUploadManifest).toHaveBeenCalledTimes(1)
    expect(mockUploadManifest).toHaveBeenCalledWith(mockImageRef, mockPrivateKey)
    expect(mockAppendToFile).toHaveBeenCalledTimes(1)
    expect(mockAppendToFile).toHaveBeenCalledWith(`${systemTime.toUTCString()}: successfully uploaded manifest with reference ${mockManifestRef}`, 'publish.log')
    jest.useRealTimers()
  })
})
