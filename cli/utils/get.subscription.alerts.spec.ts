import {
  provideGetSubscriptionAlerts,
  GetSubscriptionAlerts,
} from "./get.subscription.alerts";

describe("getSubscriptionAlerts", () => {
  let getSubscriptionAlerts: GetSubscriptionAlerts;
  const mockGetAlerts = jest.fn();
  const mockAlert = {
    hash: "0x123",
    alertId: "ALERT-1",
  };
  const mockAlert2 = {
    hash: "0x456",
    alertId: "ALERT-2",
  };
  const mockSubscriptions = [
    {
      botId: "0xbot1",
      alertId: "ALERT-1",
    },
    {
      botId: "0xbot2",
      alertId: "ALERT-2",
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
      });

    const alerts = await getSubscriptionAlerts(
      mockSubscriptions,
      mockCreatedSince
    );

    expect(alerts).toStrictEqual([mockAlert, mockAlert2]);
    expect(mockGetAlerts).toHaveBeenCalledTimes(2);
    expect(mockGetAlerts).toHaveBeenNthCalledWith(1, {
      botIds: ["0xbot1", "0xbot2"],
      alertIds: ["ALERT-1", "ALERT-2"],
      createdSince: 0,
      first: 100,
    });
    expect(mockGetAlerts).toHaveBeenNthCalledWith(2, {
      botIds: ["0xbot1", "0xbot2"],
      alertIds: ["ALERT-1", "ALERT-2"],
      createdSince: 0,
      first: 100,
      startingCursor: mockEndCursor,
    });
    jest.useRealTimers();
  });
});
