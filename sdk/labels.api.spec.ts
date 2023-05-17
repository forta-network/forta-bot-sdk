import { EntityType, Label } from "./label";
import {
  GetLabels,
  getQueryFromLabelOptions,
  provideGetLabels,
} from "./labels.api";
import { getFortaApiHeaders, getFortaApiURL } from "./utils";

describe("getLabels", () => {
  let getLabels: GetLabels;
  const mockAxios = {
    post: jest.fn(),
  } as any;
  const mockLabel = {
    createdAt: "2023-05-16T05:00:04.724235877Z",
    id: "0x6039afec21710b8f87179360ea635876b7c9612e7ca3ed4a5297bcb682b00777",
    label: {
      confidence: 0.8,
      entity: "0xb977a5eb2892f052cfab4fc469d246d1bcdab7d8",
      entityType: "ADDRESS",
      label: "scammer-eoa",
      metadata: [
        "alert_ids=SCAM-DETECTOR-ADDRESS-POISONING",
        "chain_id=1",
        "threat_description_url=https://forta.org/attacks#address-poisoning",
      ],
      remove: false,
    },
    source: {
      alertHash:
        "0xdbfc9325b0485b0f2545d424835e2ed967333126941535f91ae03f0c40a7c814",
      alertId: "SCAM-DETECTOR-ADDRESS-POISONING",
      bot: {
        id: "0x1d646c4045189991fdfd24a66b192a294158b839a6ec121d740474bdacb3ab23",
        image:
          "disco.forta.network/bafybeic2fzqhgypi7i7wqhxjvedph74euymruszdu7ghch6ocxf6msa7z4@sha256:2feb8176efa065de85f0b199bba84c291bd606e6c22e6b6c41b60f928c3cb29e",
        imageHash:
          "2feb8176efa065de85f0b199bba84c291bd606e6c22e6b6c41b60f928c3cb29e",
        manifest: "QmSM4tqw3p1y1jQyC6CAWVDPvqviv8F1ZkvdQc9H3ENwcb",
      },
      chainId: 1,
      id: "0x1d646c4045189991fdfd24a66b192a294158b839a6ec121d740474bdacb3ab23",
    },
  };

  beforeAll(() => {
    getLabels = provideGetLabels(mockAxios);
  });

  beforeEach(() => {
    mockAxios.post.mockReset();
  });

  it("throws error if GraphQL API returns error", async () => {
    mockAxios.post.mockReturnValueOnce({ data: { errors: "some error" } });

    try {
      await getLabels({});
      fail();
    } catch (e) {
      expect(e.message).toBe("some error");
      expect(mockAxios.post).toHaveBeenCalledTimes(1);
    }
  });

  it("invokes GraphQL API and parses returned labels", async () => {
    const mockResponse = {
      data: {
        data: {
          labels: {
            labels: [mockLabel],
            pageInfo: {
              hasNextPage: false,
            },
          },
        },
      },
    };
    mockAxios.post.mockReturnValueOnce(mockResponse);
    const queryOptions = {
      sourceIds: ["0xbotId1", "0xbotId2"],
      entityType: "ADDRESS",
      createdSince: 1234,
      state: true,
    };

    const { labels, pageInfo } = await getLabels(queryOptions);

    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(mockAxios.post).toHaveBeenCalledWith(
      getFortaApiURL(),
      getQueryFromLabelOptions(queryOptions),
      getFortaApiHeaders()
    );
    expect(labels).toHaveLength(1);
    expect(pageInfo.hasNextPage).toBe(
      mockResponse.data.data.labels.pageInfo.hasNextPage
    );
    const label = labels[0];
    expect(label).toBeInstanceOf(Label);
    expect(label.entityType).toBe(EntityType.Address);
    expect(label.label).toBe(mockLabel.label.label);
    expect(label.confidence).toBe(mockLabel.label.confidence);
    expect(label.remove).toBe(mockLabel.label.remove);
    expect(Object.keys(label.metadata)).toHaveLength(3);
    expect(label.metadata["threat_description_url"]).toBe(
      "https://forta.org/attacks#address-poisoning"
    );
    expect(label.id).toBe(mockLabel.id);
    expect(label.createdAt).toBe(mockLabel.createdAt);
    expect(label.source?.chainId).toBe(mockLabel.source.chainId);
    expect(label.source?.alertHash).toBe(mockLabel.source.alertHash);
  });
});
