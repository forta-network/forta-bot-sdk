import { Wallet, ethers, providers } from "ethers";
import { CommandHandler } from "../..";
import { GetCredentials } from "../../utils/get.credentials";
import { assertExists, assertIsNonEmptyString } from "../../utils";
import FortToken from "../../contracts/fort.token";
import StakingContract from "../../contracts/staking.contract";

export const MIN_STAKE = "100"; // 100 FORT
const MIN_STAKE_BN = ethers.utils.parseEther(MIN_STAKE);

export default function provideStake(
  agentId: string,
  getCredentials: GetCredentials,
  fortToken: FortToken,
  stakingContract: StakingContract,
  stakingContractAddress: string,
  ethersAgentRegistryProvider: providers.JsonRpcProvider
): CommandHandler {
  assertIsNonEmptyString(agentId, "agentId");
  assertExists(getCredentials, "getCredentials");
  assertExists(fortToken, "fortToken");
  assertExists(stakingContract, "stakingContract");
  assertIsNonEmptyString(stakingContractAddress, "stakingContractAddress");

  return async function stake(fromWallet?: Wallet) {
    const { privateKey } = await getCredentials();
    fromWallet = fromWallet ?? new Wallet(privateKey);

    const [activeStake, maticBalance, fortBalance, fortAllowance] =
      await Promise.all([
        stakingContract.activeStakeFor(agentId),
        fromWallet.connect(ethersAgentRegistryProvider).getBalance(),
        fortToken.balanceOf(fromWallet),
        fortToken.allowance(fromWallet, stakingContractAddress),
      ]);

    // check if already staked
    if (activeStake.gte(MIN_STAKE_BN)) {
      console.log(
        `agent ${agentId} already has stake of ${ethers.utils.formatEther(
          activeStake
        )} FORT (minimum required: ${MIN_STAKE} FORT)`
      );
      return;
    }

    console.log(
      `staking on agent ${agentId} from address ${fromWallet.address}...`
    );
    // verify wallet has some balance to pay transaction fee
    if (maticBalance.eq(0)) {
      throw new Error(
        `${fromWallet.address} has insufficient MATIC balance for transaction fees`
      );
    }

    // verify FORT balance
    if (fortBalance.lt(MIN_STAKE_BN)) {
      throw new Error(
        `insufficient FORT balance to stake (need minimum ${MIN_STAKE} FORT, currently have ${ethers.utils.formatEther(
          fortBalance
        )} FORT)`
      );
    }

    // approve FORT if allowance below minimum required stake
    if (fortAllowance.lt(MIN_STAKE_BN)) {
      console.log(`approving ${MIN_STAKE} FORT for staking...`);
      await fortToken.approve(fromWallet, stakingContractAddress, MIN_STAKE_BN);
    }

    // deposit stake on bot
    console.log(`staking on agent ${agentId}...`);
    await stakingContract.depositStake(fromWallet, agentId, MIN_STAKE_BN);
    console.log(`successfully staked ${MIN_STAKE} FORT on agent ${agentId}`);
  };
}
