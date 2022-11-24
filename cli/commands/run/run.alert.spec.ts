import { provideRunAlert, RunAlert } from "./run.alert";

describe("runAlert", () => {
  let runAlert: RunAlert;
  const mockRunHandlersOnAlert = jest.fn();

  beforeEach(() => {
    mockRunHandlersOnAlert.mockReset();
  });

  beforeAll(() => {
    runAlert = provideRunAlert(mockRunHandlersOnAlert);
  });

  it("runs handlers on specified alert", async () => {
    const alertHash = "0x123";

    await runAlert(alertHash);

    expect(mockRunHandlersOnAlert).toHaveBeenCalledTimes(1);
    expect(mockRunHandlersOnAlert).toHaveBeenCalledWith(alertHash);
  });

  it("runs handlers on multiple specified alerts", async () => {
    const alertHashes = "0x123,0x456";

    await runAlert(alertHashes);

    expect(mockRunHandlersOnAlert).toHaveBeenCalledTimes(2);
    expect(mockRunHandlersOnAlert).toHaveBeenNthCalledWith(1, "0x123");
    expect(mockRunHandlersOnAlert).toHaveBeenNthCalledWith(2, "0x456");
  });
});
