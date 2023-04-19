import { BigNumber, Wallet, ethers, providers } from "ethers";
import { CommandHandler } from "../..";
import { GetCredentials } from "../../utils/get.credentials";
import { assertExists, assertIsNonEmptyString } from "../../utils";
import FortToken from "../../contracts/fort.token";
import StakingContract from "../../contracts/staking.contract";

const MIN_STAKE = "100"; // 100 FORT
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

  return async function stake() {
    const { privateKey } = await getCredentials();
    const fromWallet = new Wallet(privateKey);
    console.log(
      `staking on agent ${agentId} from address ${fromWallet.address}...`
    );

    const [maticBalance, fortBalance, fortAllowance] = await Promise.all([
      fromWallet.connect(ethersAgentRegistryProvider).getBalance(),
      fortToken.balanceOf(fromWallet),
      fortToken.allowance(fromWallet, stakingContractAddress),
    ]);

    // TODO check if already staked

    // verify wallet has some balance to pay transaction fee
    if (maticBalance.eq(0)) {
      throw new Error(
        `${fromWallet.address} has insufficient MATIC balance for transaction fees`
      );
    }

    // verify FORT balance
    if (fortBalance.lt(MIN_STAKE_BN)) {
      throw new Error(
        `insufficient FORT balance to stake (need at least ${MIN_STAKE} FORT, only have ${fortBalance} FORT)`
      );
    }

    // approve FORT if allowance below minimum required stake
    if (fortAllowance.lt(MIN_STAKE_BN)) {
      console.log(`approving ${MIN_STAKE} FORT for staking...`);
      await fortToken.approve(fromWallet, stakingContractAddress, MIN_STAKE_BN);
    }

    // stake on bot
    console.log(`staking on agent ${agentId}...`);
    await stakingContract.stakeBot(fromWallet, agentId, MIN_STAKE_BN);
    console.log(`successfully staked ${MIN_STAKE} FORT on agent ${agentId}`);
  };
}
