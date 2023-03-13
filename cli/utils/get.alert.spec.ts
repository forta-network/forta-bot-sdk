import { Alert } from "../../sdk";
import provideGetAlert, {
  GetAlert,
  getCacheKey,
  ONE_DAY_IN_MS,
  LOOKBACK_PERIOD_DAYS,
} from "./get.alert";

describe("getAlert", () => {
  let getAlert: GetAlert;
  const mockGetAlerts = jest.fn();
  const mockCache = {
    getKey: jest.fn(),
    setKey: jest.fn(),
  } as any;
  const mockAlertHash = "0x123";
  const mockAlert = Alert.fromObject({
    hash: mockAlertHash,
    alertId: "ALERT-1",
  });

  const resetMocks = () => {
    mockGetAlerts.mockReset();
    mockCache.getKey.mockReset();
    mockCache.setKey.mockReset();
  };

  beforeEach(() => resetMocks());

  beforeAll(() => {
    getAlert = provideGetAlert(mockGetAlerts, mockCache);
  });

  it("returns cached alert if it exists", async () => {
    mockCache.getKey.mockReturnValue(mockAlert);

    const alert = await getAlert(mockAlertHash);

    expect(alert).toStrictEqual(mockAlert);
    expect(mockCache.getKey).toHaveBeenCalledTimes(1);
    expect(mockCache.getKey).toHaveBeenCalledWith(getCacheKey(mockAlertHash));
    expect(mockCache.setKey).toHaveBeenCalledTimes(0);
  });

  it("invokes getAlerts query and returns alerts", async () => {
    const systemTime = new Date();
    jest.useFakeTimers("modern").setSystemTime(systemTime);
    mockGetAlerts.mockReturnValue({
      alerts: [mockAlert],
    });

    const alert = await getAlert(mockAlertHash);

    expect(alert).toStrictEqual(mockAlert);
    expect(mockCache.getKey).toHaveBeenCalledTimes(1);
    expect(mockCache.getKey).toHaveBeenCalledWith(getCacheKey(mockAlertHash));
    expect(mockGetAlerts).toHaveBeenCalledTimes(1);
    expect(mockGetAlerts).toHaveBeenCalledWith({
      alertHash: mockAlertHash,
      blockDateRange: {
        startDate: new Date(
          systemTime.getTime() - LOOKBACK_PERIOD_DAYS * ONE_DAY_IN_MS
        ),
        endDate: systemTime,
      },
    });
    expect(mockCache.setKey).toHaveBeenCalledTimes(1);
    expect(mockCache.setKey).toHaveBeenCalledWith(
      getCacheKey(mockAlertHash),
      mockAlert
    );
    jest.useRealTimers();
  });
});
