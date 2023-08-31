import { Alert, BotSubscription } from "../../sdk";
import {
  provideGetSubscriptionAlerts,
  GetSubscriptionAlerts,
  TEN_MINUTES_IN_MS,
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
  const mockSubscriptions: BotSubscription[] = [
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
      alertId: "ALERT-5",
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

  it("invokes getAlerts query and returns de-duped alerts", async () => {
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
        alerts: [mockAlert],
        pageInfo: {
          hasNextPage: false,
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

    const alerts = await getSubscriptionAlerts(mockSubscriptions);

    expect(alerts.length).toEqual(3);
    expect(alerts.includes(mockAlert)).toBeTrue();
    expect(alerts.includes(mockAlert2)).toBeTrue();
    expect(alerts.includes(mockAlert3)).toBeTrue();
    expect(mockGetAlerts).toHaveBeenCalledTimes(4);
    expect(mockGetAlerts).toHaveBeenCalledWith({
      botIds: ["0xbot1"],
      alertIds: ["ALERT-1"],
      createdSince: TEN_MINUTES_IN_MS,
      first: 5000,
    });
    expect(mockGetAlerts).toHaveBeenCalledWith({
      botIds: ["0xbot1"],
      alertIds: ["ALERT-1"],
      createdSince: TEN_MINUTES_IN_MS,
      first: 5000,
      startingCursor: mockEndCursor,
    });
    expect(mockGetAlerts).toHaveBeenCalledWith({
      botIds: ["0xbot2"],
      alertIds: ["ALERT-2"],
      createdSince: TEN_MINUTES_IN_MS,
      first: 5000,
    });
    expect(mockGetAlerts).toHaveBeenCalledWith({
      botIds: ["0xbot3"],
      alertIds: ["ALERT-5", "ALERT-3", "ALERT-4"],
      createdSince: TEN_MINUTES_IN_MS,
      chainId: 137,
      first: 5000,
    });
  });

  it("alerts seen before should be filtered out", async () => {
    mockGetAlerts.mockReturnValue({
      alerts: [mockAlert],
      pageInfo: {
        hasNextPage: false,
      },
    });

    const alerts = await getSubscriptionAlerts(mockSubscriptions);

    expect(alerts).toBeEmpty();
    expect(mockGetAlerts).toHaveBeenCalledTimes(3);
  });
});
