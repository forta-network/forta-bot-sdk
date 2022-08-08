import provideLogs, { getNextMinute } from "."
import { CommandHandler } from "../.."

const data = [
    {scanner: "1x1", timestamp: "2022-03-20T13:01:00Z", logs: "I am a scanner"},
    {scanner: "0x1", timestamp: "2022-03-20T12:43:00Z", logs: "Am I a scanner"},
    {scanner: "0x2", timestamp: "2022-03-20T12:42:00Z", logs: "Why a scanner"},
    {scanner: "0x3", timestamp: "2022-03-20T12:41:00Z", logs: "What is a scanner"},
    {scanner: "0x4", timestamp: "2022-03-20T12:40:00Z", logs: "Scanner"}
]

describe("logs", () => {
  let logs: CommandHandler

  const mockContainer = {
    resolve: jest.fn()
  } as any

  const mockGetBotLogs = jest.fn();

  const mockBotLogs: any[] = data;
  let consoleSpy = jest.spyOn(console, 'log');

  const mockBotId = "0x15293"

  const resetMocks = () => {
    mockContainer.resolve.mockReset()
    mockGetBotLogs.mockReset()
    consoleSpy.mockReset()
  }

  beforeEach(() => resetMocks())

  beforeAll(() => {
    logs = provideLogs(mockBotId, mockGetBotLogs, {agentId: mockBotId})
  })

  it("throws error if invalid timestamp provided for --after ", async () => {
    const latestTimestamp = "2022-03-20T12:42:40Z"
    const earliestTimestamp = "2022-03-1912:42"
    try {
      logs = provideLogs(mockBotId, mockGetBotLogs, {agentId: mockBotId, after: earliestTimestamp, before: latestTimestamp})
      await logs()
    } catch(e) {
      expect(e.message).toBe(`Field name \'after\' has invalid value. ${earliestTimestamp} is not a valid ISO timestamp. The ISO format is: YYYY-MM-DDTHH:mmZ`)
    }
  })

  it("throws error if invalid timestamp provided for --before ", async () => {
    const latestTimestamp = "2022-03-20T12:42"
    const earliestTimestamp = "2022-03-19T12:42:40Z"
    try {
      logs = provideLogs(mockBotId, mockGetBotLogs, {agentId: mockBotId, after: earliestTimestamp, before: latestTimestamp})
      await logs()
    } catch(e) {
      expect(e.message).toBe(`Field name \'before\' has invalid value. ${latestTimestamp} is not a valid ISO timestamp. The ISO format is: YYYY-MM-DDTHH:mmZ`)
    }
  })

  it("throws error if the requested latest timestamp is before the earliest timestamp", async () => {
    const earliestTimestamp = "2022-03-20T12:42:00.000Z"
    const latestTimestamp = "2022-03-19T12:42:00.000Z"
    try {
      logs = provideLogs(mockBotId, mockGetBotLogs, {agentId: mockBotId, after: earliestTimestamp, before: latestTimestamp})
      await logs()
    } catch(e) {
      expect(e.message).toBe('Provided date range is invalid')
    }
  })


  it("only prints single log for agent in given 5 minute time range", async () => {
    const earliestTimestamp = "2022-03-20T13:00:00.000Z";
    const latestTimestamp = "2022-03-20T13:04:00.000Z";

    mockGetBotLogs.mockReturnValueOnce([mockBotLogs[0]]).mockReturnValue([])

    logs = provideLogs(mockBotId, mockGetBotLogs, {agentId: mockBotId, after: earliestTimestamp, before: latestTimestamp})
    await logs()

    expect(mockGetBotLogs).toHaveBeenCalledTimes(5);
    expect(consoleSpy).toBeCalledTimes(3)
  })

  it("only prints 5 logs for agent in given time range", async () => {
    const earliestTimestamp = "2022-03-20T12:34:00.000Z";
    const latestTimestamp = "2022-03-20T13:03:00.000Z";

    mockGetBotLogs.mockReturnValueOnce([mockBotLogs[0]])
    .mockReturnValueOnce([mockBotLogs[1]])
    .mockReturnValueOnce([mockBotLogs[2]])
    .mockReturnValueOnce([mockBotLogs[3]])
    .mockReturnValueOnce([mockBotLogs[4]])

    logs = provideLogs(mockBotId, mockGetBotLogs, {agentId: mockBotId, after: earliestTimestamp, before: latestTimestamp})
    await logs()

    expect(mockGetBotLogs).toHaveBeenCalledTimes(30); // 1 call for every minute in range
    expect(consoleSpy).toBeCalledTimes(15)
  })
})

describe("getNextMinute", () => {
  it("return undefined if current minute is equal to the latest requested timestamp", async () => {
    const latestTimestamp = new Date("2022-03-20T13:04:00.000Z");
    const curTimestamp = latestTimestamp;

    const result = getNextMinute(curTimestamp,latestTimestamp);
    expect(result).toBe(undefined)
  }) 


  it("return Date 1 minute in the future if current minute is less than latest requested timestamp", async () => {
    const latestTimestamp = new Date("2022-03-20T13:04:00.000Z");
    const curTimestamp = new Date("2022-03-20T12:04:00.000Z");;

    const result = getNextMinute(curTimestamp,latestTimestamp);
    expect(result?.toISOString()).toBe("2022-03-20T12:05:00.000Z")
  }) 
})