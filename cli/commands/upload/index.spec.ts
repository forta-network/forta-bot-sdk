import provideUpload from "."

describe("upload", () => {
  it("uploads a bot manifest and prints out the reference with a message", async () => {
    const mockGetCredentials = jest.fn()
    const mockUploadManifest = jest.fn()
    const mockAppendToFile = jest.fn()

    const mockPrivateKey = "0x4567"
    mockGetCredentials.mockReturnValueOnce({ privateKey: mockPrivateKey})
    const systemTime = new Date()
    jest.useFakeTimers('modern').setSystemTime(systemTime)
    const mockManifestRef = 'someManifestRef'
    mockUploadManifest.mockReturnValueOnce(mockManifestRef)
    const mockCliArgs = {imageRef: 'someImageRef'}

    const push = provideUpload(mockGetCredentials, mockUploadManifest, mockAppendToFile, mockCliArgs)
    await push()

    expect(mockUploadManifest).toHaveBeenCalledTimes(1)
    expect(mockUploadManifest).toHaveBeenCalledWith(mockCliArgs.imageRef, mockPrivateKey)
    expect(mockAppendToFile).toHaveBeenCalledTimes(1)
    expect(mockAppendToFile).toHaveBeenCalledWith(`${systemTime.toUTCString()}: successfully uploaded manifest with reference ${mockManifestRef}`, 'publish.log')
    jest.useRealTimers()
  })

  it("uploads a bot manifest and prints out only the reference when --refOnly flag is provided", async () => {
    const mockGetCredentials = jest.fn()
    const mockUploadManifest = jest.fn()
    const mockAppendToFile = jest.fn()

    const mockPrivateKey = "0x4567"
    mockGetCredentials.mockReturnValueOnce({ privateKey: mockPrivateKey})
    const systemTime = new Date()
    jest.useFakeTimers('modern').setSystemTime(systemTime)
    const mockManifestRef = 'someManifestRef'
    mockUploadManifest.mockReturnValueOnce(mockManifestRef)
    const mockCliArgs = {imageRef: 'someImageRef', refOnly: true}

    const push = provideUpload(mockGetCredentials, mockUploadManifest, mockAppendToFile, mockCliArgs)
    await push()

    expect(mockUploadManifest).toHaveBeenCalledTimes(1)
    expect(mockUploadManifest).toHaveBeenCalledWith(mockCliArgs.imageRef, mockPrivateKey)
    expect(mockAppendToFile).toHaveBeenCalledTimes(1)
    expect(mockAppendToFile).toHaveBeenCalledWith(mockManifestRef, 'publish.log')
    jest.useRealTimers()
  })
})
