import provideWithRetry, { WithRetry } from "./with.retry";

describe("withRetry", () => {
  let withRetry: WithRetry;
  const mockSleep = jest.fn();
  const mockFunc = jest.fn();
  const mockResponseValue = "some value";

  beforeAll(() => {
    withRetry = provideWithRetry(mockSleep);
  });

  beforeEach(() => {
    mockSleep.mockReset();
    mockFunc.mockReset();
  });

  it("throws error if given function fails more than 3 times", async () => {
    mockFunc.mockRejectedValue("error");

    try {
      await withRetry(mockFunc, [1, "abc", []]);
    } catch (e) {
      expect(e).toBe("error");
      expect(mockFunc).toHaveBeenCalledTimes(3);
      expect(mockFunc).toHaveBeenCalledWith(1, "abc", []);
      expect(mockSleep).toHaveBeenCalledTimes(2);
      expect(mockSleep).toHaveBeenNthCalledWith(1, 1000);
      expect(mockSleep).toHaveBeenNthCalledWith(2, 2000);
    }
  });

  it("invokes the given function up to max 3 times and returns its response", async () => {
    mockFunc
      .mockRejectedValueOnce("error")
      .mockRejectedValueOnce("error")
      .mockReturnValueOnce(mockResponseValue);

    const response = await withRetry(mockFunc, [1, "abc", []]);

    expect(response).toBe(mockResponseValue);
    expect(mockFunc).toHaveBeenCalledTimes(3);
    expect(mockFunc).toHaveBeenCalledWith(1, "abc", []);
    expect(mockSleep).toHaveBeenCalledTimes(2);
    expect(mockSleep).toHaveBeenNthCalledWith(1, 1000);
    expect(mockSleep).toHaveBeenNthCalledWith(2, 2000);
  });
});
