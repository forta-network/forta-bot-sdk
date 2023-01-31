import providePush from "."

describe("push", () => {
  it("uploads agent image and prints out the reference with a message", async () => {
    const mockUploadImage = jest.fn()
    const mockAppendToFile = jest.fn()

    const systemTime = new Date()
    jest.useFakeTimers('modern').setSystemTime(systemTime)
    const mockImageRef = "someImageRef"
    mockUploadImage.mockReturnValueOnce(mockImageRef)
    const mockCliArgs = {}

    const push = providePush(mockUploadImage, mockAppendToFile, mockCliArgs)
    await push()

    expect(mockUploadImage).toHaveBeenCalledTimes(1)
    expect(mockUploadImage).toHaveBeenCalledWith()
    expect(mockAppendToFile).toHaveBeenCalledTimes(1)
    expect(mockAppendToFile).toHaveBeenCalledWith(`${systemTime.toUTCString()}: successfully pushed image with reference ${mockImageRef}`, 'publish.log')
    jest.useRealTimers()
  })

  it("uploads agent image and prints out only the reference when --refOnly flag is provided", async () => {
    const mockUploadImage = jest.fn()
    const mockAppendToFile = jest.fn()

    const systemTime = new Date()
    jest.useFakeTimers('modern').setSystemTime(systemTime)
    const mockImageRef = "someImageRef"
    mockUploadImage.mockReturnValueOnce(mockImageRef)
    const mockCliArgs = {refOnly: true}

    const push = providePush(mockUploadImage, mockAppendToFile, mockCliArgs)
    await push()

    expect(mockUploadImage).toHaveBeenCalledTimes(1)
    expect(mockUploadImage).toHaveBeenCalledWith()
    expect(mockAppendToFile).toHaveBeenCalledTimes(1)
    expect(mockAppendToFile).toHaveBeenCalledWith(mockImageRef, 'publish.log')
    jest.useRealTimers()
  })
})
