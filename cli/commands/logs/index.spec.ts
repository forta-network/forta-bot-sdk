import provideLogs, { getNextMinute, shouldScanForwardOrBackward } from "."
import { CommandHandler } from "../.."

const data = [
    {scanner: "0x0", timestamp: "2022-03-20T13:01:00Z", logs: "I am a scanner"},
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

  const mockGetAgentLogs = jest.fn();

  const mockAgentsLogs: any[] = data;
  let consoleSpy = jest.spyOn(console, 'log');

  const mockScannerId = mockAgentsLogs[0].scanner;
  const mockAgentId = "0x15293"

  const resetMocks = () => {
    mockContainer.resolve.mockReset()
    mockGetAgentLogs.mockReset()
    consoleSpy.mockReset()
  }

  beforeEach(() => resetMocks())

  beforeAll(() => {
    logs = provideLogs(mockContainer, mockAgentId, mockGetAgentLogs, "2022-03-20T12:41:00Z", "2022-03-20T13:00:00Z"" )
  })

  it("throws error if no agentId provided", async () => {
    try {
      logs(undefined)
    } catch(e) {
      expect(e.message).toBe("No agentId provided")
    }
  })

  it("throws error if invalid timestamp provided for --after ", async () => {
    const earliestTimestamp = "2022-03-20T12:42"
    try {
      logs({agentId: mockAgentId, after: earliestTimestamp})
    } catch(e) {
      expect(e.message).toBe(`${earliestTimestamp} is not a valid ISO timestamp. The ISO format is: YYYY-MM-DDTHH:mm:ss.sssZ`)
    }
  })

  it("throws error if invalid timestamp provided for --before ", async () => {
    const latestTimestamp = "2022-03-20T12:42"
    try {
      logs({agentId: mockAgentId, before: latestTimestamp})
    } catch(e) {
      expect(e.message).toBe(`${latestTimestamp} is not a valid ISO timestamp. The ISO format is: YYYY-MM-DDTHH:mm:ss.sssZ`)
    }
  })

  it("throws error if the requested latest timestamp is before the earliest timestamp", async () => {
    const earliestTimestamp = "2022-03-20T12:42:00.000Z"
    const latestTimestamp = "2022-03-19T12:42:00.000Z"
    try {
      logs({agentId: mockAgentId, before: latestTimestamp, after: earliestTimestamp})
    } catch(e) {
      expect(e.message).toBe('Provided date range is invalid')
    }
  })


  it("only prints single log for agent in given 5 minute time range", async () => {
    const earliestTimestamp = "2022-03-20T13:00:00.000Z";
    const latestTimestamp = "2022-03-20T13:04:00.000Z";

    mockContainer.resolve.mockReturnValueOnce(mockGetAgentLogs)
    mockGetAgentLogs.mockReturnValueOnce([mockAgentsLogs[0]]).mockReturnValue([])

    await logs({agentId: mockAgentId, before: latestTimestamp, after: earliestTimestamp})

    expect(mockContainer.resolve).toHaveBeenCalledTimes(1);
    expect(mockContainer.resolve).toHaveBeenCalledWith("getAgentLogs");
    expect(mockGetAgentLogs).toHaveBeenCalledTimes(5);
    expect(consoleSpy).toBeCalledTimes(1)
  })

  it("only prints 5 logs for agent in given time range", async () => {
    const earliestTimestamp = "2022-03-20T12:34:00.000Z";
    const latestTimestamp = "2022-03-20T13:03:00.000Z";

    mockContainer.resolve.mockReturnValueOnce(mockGetAgentLogs)

    mockGetAgentLogs.mockReturnValueOnce([mockAgentsLogs[0]])
    .mockReturnValueOnce([mockAgentsLogs[1]])
    .mockReturnValueOnce([mockAgentsLogs[2]])
    .mockReturnValueOnce([mockAgentsLogs[3]])
    .mockReturnValueOnce([mockAgentsLogs[4]])

    await logs({agentId: mockAgentId, before: latestTimestamp, after: earliestTimestamp})

    expect(mockContainer.resolve).toHaveBeenCalledTimes(1);
    expect(mockContainer.resolve).toHaveBeenCalledWith("getAgentLogs");
    expect(mockGetAgentLogs).toHaveBeenCalledTimes(30); // 1 call for every minute in range
    expect(consoleSpy).toBeCalledTimes(5)
  })



  it("only prints single log for agent with given scannerId", async () => {
    const earliestTimestamp = "2022-03-20T12:34:00.000Z";
    const latestTimestamp = "2022-03-20T13:04:00.000Z";

    mockContainer.resolve.mockReturnValueOnce(mockGetAgentLogs)

    mockGetAgentLogs.mockReturnValueOnce([mockAgentsLogs[0]])
    .mockReturnValueOnce([mockAgentsLogs[1]])
    .mockReturnValueOnce([mockAgentsLogs[2]])
    .mockReturnValueOnce([mockAgentsLogs[3]])
    .mockReturnValueOnce([mockAgentsLogs[4]])

    await logs({agentId: mockAgentId, before: latestTimestamp, after: earliestTimestamp, scannerId: mockScannerId})

    expect(mockContainer.resolve).toHaveBeenCalledTimes(1);
    expect(mockContainer.resolve).toHaveBeenCalledWith("getAgentLogs");
    expect(consoleSpy).toBeCalledTimes(1)
  })

  it("defaults to the last 24 hours of logs if no time range passed in", async () => {
    const MINUTES_IN_A_DAY = 1440;

    mockContainer.resolve.mockReturnValueOnce(mockGetAgentLogs)

    mockGetAgentLogs.mockReturnValueOnce([])

    await logs({agentId: mockAgentId})

    expect(mockContainer.resolve).toHaveBeenCalledTimes(1);
    expect(mockContainer.resolve).toHaveBeenCalledWith("getAgentLogs");
    expect(mockGetAgentLogs).toHaveBeenCalledTimes(MINUTES_IN_A_DAY + 1);
    expect(consoleSpy).toBeCalledTimes(0)
  })
})

describe("shouldScanForwardOrBackward", () => {
  it("return forward given a range of time", async () => {
    const earliestTimestamp = "2022-03-20T12:34:00.000Z";
    const latestTimestamp = "2022-03-20T13:04:00.000Z";

    const result = shouldScanForwardOrBackward(earliestTimestamp, latestTimestamp);
    expect(result).toBe("forward")
  }) 

  it("return forward given only an earliest timestamp", async () => {
    const earliestTimestamp = "2022-03-20T12:34:00.000Z";

    const result = shouldScanForwardOrBackward(earliestTimestamp);
    expect(result).toBe("forward")
  }) 

  it("return backward given only an latest timestamp", async () => {
    const latestTimestamp = "2022-03-20T12:34:00.000Z";

    const result = shouldScanForwardOrBackward(undefined, latestTimestamp);
    expect(result).toBe("backward")
  }) 
})

describe("getNextMinute", () => {
  it("return undefined if current minute is equal to the latest requested timestamp", async () => {
    const latestTimestamp = new Date("2022-03-20T13:04:00.000Z");
    const curTimestamp = latestTimestamp;

    const result = getNextMinute(curTimestamp, "forward", undefined,latestTimestamp);
    expect(result).toBe(undefined)
  }) 

  it("return undefined if current minute is equal to the earliest requested timestamp", async () => {
    const earliestTimestamp = new Date("2022-03-20T13:04:00.000Z");
    const curTimestamp = earliestTimestamp;

    const result = getNextMinute(curTimestamp, "backward", earliestTimestamp,undefined);
    expect(result).toBe(undefined)
  }) 

  it("return Date 1 minute in the future if current minute is less than latest requested timestamp", async () => {
    const latestTimestamp = new Date("2022-03-20T13:04:00.000Z");
    const curTimestamp = new Date("2022-03-20T12:04:00.000Z");;

    const result = getNextMinute(curTimestamp, "forward", undefined,latestTimestamp);
    expect(result?.toISOString()).toBe("2022-03-20T12:05:00.000Z")
  }) 

  it("return Date 1 minute in the past if current minute is greater than earliest requested timestamp", async () => {
    const curTimestamp = new Date("2022-03-20T13:04:00.000Z");
    const earliestTimestamp = new Date("2022-03-20T12:04:00.000Z");;

    const result = getNextMinute(curTimestamp, "backward", earliestTimestamp, undefined);
    expect(result?.toISOString()).toBe("2022-03-20T13:03:00.000Z")
  }) 
})