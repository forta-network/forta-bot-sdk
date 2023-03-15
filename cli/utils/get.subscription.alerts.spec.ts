import { Alert } from "../../sdk";
import {
  provideGetSubscriptionAlerts,
  GetSubscriptionAlerts,
} from "./get.subscription.alerts";

describe("getSubscriptionAlerts", () => {
  let getSubscriptionAlerts: GetSubscriptionAlerts;
  const mockGetAlerts = jest.fn();
  const mockAlert = Alert.fromObject({
    hash: "0x123",
    alertId: "ALERT-1",
  });
  const mockAlert2 = Alert.fromObject({
    hash: "0x456",
    alertId: "ALERT-2",
  });
  const mockAlert3 = Alert.fromObject({
    hash: "0x789",
    alertId: "ALERT-3",
  });
  const mockSubscriptions = [
    {
      botId: "0xbot1",
      alertId: "ALERT-1",
    },
    {
      botId: "0xbot2",
      alertId: "ALERT-2",
    },
    {
      botId: "0xbot3",
      alertIds: ["ALERT-3", "ALERT-4"],
      chainId: 137,
    },
  ];

  const resetMocks = () => {
    mockGetAlerts.mockReset();
  };

  beforeEach(() => resetMocks());

  beforeAll(() => {
    getSubscriptionAlerts = provideGetSubscriptionAlerts(mockGetAlerts);
  });

  it("invokes getAlerts query and returns alerts", async () => {
    const systemTime = new Date();
    jest.useFakeTimers("modern").setSystemTime(systemTime);
    const mockCreatedSince = new Date();
    const mockEndCursor = "some cursor";
    mockGetAlerts
      .mockReturnValueOnce({
        alerts: [mockAlert],
        pageInfo: {
          hasNextPage: true,
          endCursor: mockEndCursor,
        },
      })
      .mockReturnValueOnce({
        alerts: [mockAlert2],
        pageInfo: {
          hasNextPage: false,
        },
      })
      .mockReturnValueOnce({
        alerts: [mockAlert3],
        pageInfo: {
          hasNextPage: false,
        },
      });

    const alerts = await getSubscriptionAlerts(
      mockSubscriptions,
      mockCreatedSince
    );

    expect(alerts.length).toEqual(3);
    expect(alerts.includes(mockAlert)).toBeTrue();
    expect(alerts.includes(mockAlert2)).toBeTrue();
    expect(alerts.includes(mockAlert3)).toBeTrue();
    expect(mockGetAlerts).toHaveBeenCalledTimes(3);
    expect(mockGetAlerts).toHaveBeenCalledWith({
      botIds: ["0xbot1", "0xbot2"],
      alertIds: ["ALERT-1", "ALERT-2"],
      createdSince: 0,
      first: 1000,
    });
    expect(mockGetAlerts).toHaveBeenCalledWith({
      botIds: ["0xbot1", "0xbot2"],
      alertIds: ["ALERT-1", "ALERT-2"],
      createdSince: 0,
      first: 1000,
      startingCursor: mockEndCursor,
    });
    expect(mockGetAlerts).toHaveBeenCalledWith({
      botIds: ["0xbot3"],
      alertIds: ["ALERT-3", "ALERT-4"],
      createdSince: 0,
      chainId: 137,
      first: 1000,
    });
    jest.useRealTimers();
  });
});
