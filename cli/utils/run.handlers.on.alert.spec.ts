import {
  provideRunHandlersOnAlert,
  RunHandlersOnAlert,
} from "./run.handlers.on.alert";

describe("runHandlersOnAlert", () => {
  let runHandlersOnAlert: RunHandlersOnAlert;
  const mockGetAgentHandlers = jest.fn();
  const mockGetAlert = jest.fn();
  const mockCreateAlertEvent = jest.fn();
  const mockHandleAlert = jest.fn();
  const mockAlertHash = "0x123";
  const mockAlert = {
    hash: mockAlertHash,
    alertId: "ALERT-1",
  };
  const mockFinding = {
    some: "finding",
  };

  beforeEach(() => {
    mockGetAgentHandlers.mockReset();
    mockGetAlert.mockReset();
    mockCreateAlertEvent.mockReset();
    mockHandleAlert.mockReset();
  });

  beforeAll(() => {
    runHandlersOnAlert = provideRunHandlersOnAlert(
      mockGetAgentHandlers,
      mockGetAlert,
      mockCreateAlertEvent
    );
  });

  it("throws error if no alert handler found", async () => {
    mockGetAgentHandlers.mockReturnValueOnce({});

    try {
      await runHandlersOnAlert(mockAlertHash);
    } catch (e) {
      expect(e.message).toEqual("no alert handler found");
    }

    expect(mockGetAgentHandlers).toHaveBeenCalledTimes(1);
  });

  it("if string hash provided, fetches alert and runs handlers on alert", async () => {
    mockGetAgentHandlers.mockReturnValue({ handleAlert: mockHandleAlert });
    mockGetAlert.mockReturnValue(mockAlert);
    mockHandleAlert.mockReturnValue([mockFinding]);
    const mockAlertEvent = {
      alert: mockAlert,
    };
    mockCreateAlertEvent.mockReturnValue(mockAlertEvent);

    const findings = await runHandlersOnAlert(mockAlertHash);

    expect(findings).toStrictEqual([mockFinding]);
    expect(mockGetAlert).toHaveBeenCalledTimes(1);
    expect(mockGetAlert).toHaveBeenCalledWith(mockAlertHash);
    expect(mockCreateAlertEvent).toHaveBeenCalledTimes(1);
    expect(mockCreateAlertEvent).toHaveBeenCalledWith(mockAlert);
    expect(mockHandleAlert).toHaveBeenCalledTimes(1);
    expect(mockHandleAlert).toHaveBeenCalledWith(mockAlertEvent);
  });

  it("if alert object provided, runs handlers on alert", async () => {
    mockGetAgentHandlers.mockReturnValue({ handleAlert: mockHandleAlert });
    mockHandleAlert.mockReturnValue([mockFinding]);
    const mockAlertEvent = {
      alert: mockAlert,
    };
    mockCreateAlertEvent.mockReturnValue(mockAlertEvent);

    const findings = await runHandlersOnAlert(mockAlert);

    expect(findings).toStrictEqual([mockFinding]);
    expect(mockGetAlert).toHaveBeenCalledTimes(0);
    expect(mockCreateAlertEvent).toHaveBeenCalledTimes(1);
    expect(mockCreateAlertEvent).toHaveBeenCalledWith(mockAlert);
    expect(mockHandleAlert).toHaveBeenCalledTimes(1);
    expect(mockHandleAlert).toHaveBeenCalledWith(mockAlertEvent);
  });
});
