import provideStake from ".";
import { CommandHandler } from "../..";

describe("stake", () => {
  let stake: CommandHandler;
  const mockAgentId = "0xmockId";
  const mockGetCredentials = jest.fn();
  const mockFortToken = {} as any;
  const mockStakingContract = {} as any;
  const mockStakingContractAddress = "0xmockAddress";
  const mockEthersProvider = {} as any;

  beforeAll(() => {
    stake = provideStake(
      mockAgentId,
      mockGetCredentials,
      mockFortToken,
      mockStakingContract,
      mockStakingContractAddress,
      mockEthersProvider
    );
  });

  it("uploads agent image and prints out reference", async () => {
    const systemTime = new Date();
    jest.useFakeTimers("modern").setSystemTime(systemTime);
    const mockImageRef = "someImageRef";
    mockUploadImage.mockReturnValueOnce(mockImageRef);

    await push();

    expect(mockUploadImage).toHaveBeenCalledTimes(1);
    expect(mockUploadImage).toHaveBeenCalledWith();
    expect(mockAppendToFile).toHaveBeenCalledTimes(1);
    expect(mockAppendToFile).toHaveBeenCalledWith(
      `${systemTime.toUTCString()}: successfully pushed image with reference ${mockImageRef}`,
      "publish.log"
    );
    jest.useRealTimers();
  });
});
