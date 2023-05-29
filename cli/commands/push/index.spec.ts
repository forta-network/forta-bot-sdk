import providePush from "."

describe("push", () => {
  it("pushes a bot image and prints out the reference with a message", async () => {
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

    const push = providePush(mockGetCredentials, mockUploadImage, mockUploadManifest, mockAppendToFile, mockCliArgs)
    await push()

    expect(mockUploadImage).toHaveBeenCalledTimes(1)
    expect(mockUploadImage).toHaveBeenCalledWith()
    expect(mockUploadImage).toHaveBeenCalledBefore(mockGetCredentials)
    expect(mockGetCredentials).not.toHaveBeenCalled()
    expect(mockUploadManifest).not.toHaveBeenCalled()
    expect(mockAppendToFile).toHaveBeenCalledTimes(1)
    expect(mockAppendToFile).toHaveBeenCalledWith(`${systemTime.toUTCString()}: successfully pushed image with reference ${mockImageRef}`, 'publish.log')
    jest.useRealTimers()
  })

  it("pushes a bot image and uploads a bot manifest when --manifest flag is used and prints out the references with messages", async () => {
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
    const mockCliArgs = {manifest: true}

    const push = providePush(mockGetCredentials, mockUploadImage, mockUploadManifest, mockAppendToFile, mockCliArgs)
    await push()

    expect(mockUploadImage).toHaveBeenCalledTimes(1)
    expect(mockUploadImage).toHaveBeenCalledWith()
    expect(mockUploadImage).toHaveBeenCalledBefore(mockGetCredentials)
    expect(mockGetCredentials).toHaveBeenCalledTimes(1)
    expect(mockGetCredentials).toHaveBeenCalledWith()
    expect(mockGetCredentials).toHaveBeenCalledBefore(mockUploadManifest)
    expect(mockUploadManifest).toHaveBeenCalledTimes(1)
    expect(mockUploadManifest).toHaveBeenCalledWith(mockImageRef, mockPrivateKey)
    expect(mockAppendToFile).toHaveBeenCalledTimes(2)
    expect(mockAppendToFile).toHaveBeenCalledWith(`${systemTime.toUTCString()}: successfully pushed image with reference ${mockImageRef}`, 'publish.log')
    expect(mockAppendToFile).toHaveBeenCalledWith(`${systemTime.toUTCString()}: successfully uploaded manifest with reference ${mockManifestRef}`, 'publish.log')
    jest.useRealTimers()
  })
})
