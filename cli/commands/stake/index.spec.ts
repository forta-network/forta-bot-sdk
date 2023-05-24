import { ethers } from "ethers";
import provideStake, { MIN_STAKE } from ".";
import { CommandHandler } from "../..";

describe("stake", () => {
  let stake: CommandHandler;
  const mockAgentId = "0xmockId";
  const mockPrivateKey = "0xprivkey";
  const mockGetCredentials = jest
    .fn()
    .mockReturnValue({ privateKey: mockPrivateKey });
  const mockFortToken = {
    approve: jest.fn(),
    balanceOf: jest.fn(),
    allowance: jest.fn(),
  } as any;
  const mockStakingContract = {
    activeStakeFor: jest.fn(),
    depositStake: jest.fn(),
  } as any;
  const mockEthersProvider = {} as any;
  const mockStakingContractAddress = "0xmockAddress";
  const mockFromWallet = {
    address: "0x1234",
    connect: jest.fn().mockReturnThis(),
    getBalance: jest.fn(),
  } as any;

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

  beforeEach(() => {
    mockFortToken.approve.mockReset();
    mockStakingContract.depositStake.mockReset();
  });

  it("does nothing if agent already stake above minimum", async () => {
    mockStakingContract.activeStakeFor.mockReturnValueOnce(
      ethers.utils.parseEther("100")
    );

    await stake(mockFromWallet);

    expect(mockFortToken.approve).toHaveBeenCalledTimes(0);
    expect(mockStakingContract.depositStake).toHaveBeenCalledTimes(0);
  });

  it("throws error if insufficient MATIC balance", async () => {
    mockStakingContract.activeStakeFor.mockReturnValueOnce(
      ethers.utils.parseEther("1")
    );
    mockFromWallet.getBalance.mockReturnValueOnce(ethers.utils.parseEther("0"));

    try {
      await stake(mockFromWallet);
    } catch (e) {
      expect(e.message).toBe(
        `${mockFromWallet.address} has insufficient MATIC balance for transaction fees`
      );
      expect(mockFortToken.approve).toHaveBeenCalledTimes(0);
      expect(mockStakingContract.depositStake).toHaveBeenCalledTimes(0);
    }
  });

  it("throws error if insufficient FORT balance", async () => {
    mockStakingContract.activeStakeFor.mockReturnValueOnce(
      ethers.utils.parseEther("1")
    );
    mockFromWallet.getBalance.mockReturnValueOnce(ethers.utils.parseEther("1"));
    mockFortToken.balanceOf.mockReturnValueOnce(ethers.utils.parseEther("1"));

    try {
      await stake(mockFromWallet);
    } catch (e) {
      expect(e.message).toBe(
        `insufficient FORT balance to stake (need minimum ${MIN_STAKE} FORT, currently have 1.0 FORT)`
      );
      expect(mockFortToken.approve).toHaveBeenCalledTimes(0);
      expect(mockStakingContract.depositStake).toHaveBeenCalledTimes(0);
    }
  });

  it("approves and deposits stake when there is insufficient allowance", async () => {
    mockStakingContract.activeStakeFor.mockReturnValueOnce(
      ethers.utils.parseEther("1")
    );
    mockFromWallet.getBalance.mockReturnValueOnce(ethers.utils.parseEther("1"));
    mockFortToken.balanceOf.mockReturnValueOnce(ethers.utils.parseEther("100"));
    mockFortToken.allowance.mockReturnValueOnce(ethers.utils.parseEther("1"));

    await stake(mockFromWallet);

    expect(mockFortToken.approve).toHaveBeenCalledTimes(1);
    expect(mockFortToken.approve).toHaveBeenCalledWith(
      mockFromWallet,
      mockStakingContractAddress,
      ethers.utils.parseEther(MIN_STAKE)
    );
    expect(mockStakingContract.depositStake).toHaveBeenCalledTimes(1);
    expect(mockStakingContract.depositStake).toHaveBeenCalledWith(
      mockFromWallet,
      mockAgentId,
      ethers.utils.parseEther(MIN_STAKE)
    );
  });

  it("deposits stake without approving when there is sufficient allowance", async () => {
    mockStakingContract.activeStakeFor.mockReturnValueOnce(
      ethers.utils.parseEther("1")
    );
    mockFromWallet.getBalance.mockReturnValueOnce(ethers.utils.parseEther("1"));
    mockFortToken.balanceOf.mockReturnValueOnce(ethers.utils.parseEther("100"));
    mockFortToken.allowance.mockReturnValueOnce(ethers.utils.parseEther("100"));

    await stake(mockFromWallet);

    expect(mockFortToken.approve).toHaveBeenCalledTimes(0);
    expect(mockStakingContract.depositStake).toHaveBeenCalledTimes(1);
    expect(mockStakingContract.depositStake).toHaveBeenCalledWith(
      mockFromWallet,
      mockAgentId,
      ethers.utils.parseEther(MIN_STAKE)
    );
  });
});
