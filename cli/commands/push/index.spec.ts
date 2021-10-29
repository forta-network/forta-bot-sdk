import providePush from "."
import { CommandHandler } from "../.."

describe("push", () => {
  let push: CommandHandler
  const mockUploadImage = jest.fn()
  const mockAppendToFile = jest.fn()

  beforeAll(() => {
    push = providePush(mockUploadImage, mockAppendToFile)
  })

  it("uploads agent image and prints out reference", async () => {
    const systemTime = new Date()
    jest.useFakeTimers('modern').setSystemTime(systemTime)
    const mockImageRef = "someImageRef"
    mockUploadImage.mockReturnValueOnce(mockImageRef)

    await push({})

    expect(mockUploadImage).toHaveBeenCalledTimes(1)
    expect(mockUploadImage).toHaveBeenCalledWith()
    expect(mockAppendToFile).toHaveBeenCalledTimes(1)
    expect(mockAppendToFile).toHaveBeenCalledWith(`${systemTime.toUTCString()}: successfully pushed image with reference ${mockImageRef}`, 'publish.log')
    jest.useRealTimers()
  })
})