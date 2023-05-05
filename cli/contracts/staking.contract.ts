import { BigNumber, Wallet, ethers, providers } from "ethers";
import StakingContractAbi from "./staking.contract.abi.json";
import { getTxOptions } from "./utils";

const AGENT_SUBJECT_TYPE = 1;
const FALLBACK_DEPOSIT_GAS_LIMIT = BigNumber.from(255_000);

export default class StakingContract {
  constructor(
    private ethersPolygonProvider: providers.JsonRpcProvider,
    private stakingContractAddress: string
  ) {}

  async activeStakeFor(agentId: string) {
    return this.getContract().activeStakeFor(AGENT_SUBJECT_TYPE, agentId);
  }

  async depositStake(fromWallet: Wallet, agentId: string, amount: BigNumber) {
    const contract = this.getContract(fromWallet);
    let gas = FALLBACK_DEPOSIT_GAS_LIMIT;
    try {
      gas = await contract.estimateGas.deposit(
        AGENT_SUBJECT_TYPE,
        agentId,
        amount
      );
    } catch (e) {
      console.log(
        `unable to estimate gas for deposit, using fallback gas limit (${gas})`
      );
    }
    const txOptions = await getTxOptions(
      gas,
      fromWallet.connect(this.ethersPolygonProvider)
    );
    const tx = await contract.deposit(
      AGENT_SUBJECT_TYPE,
      agentId,
      amount,
      txOptions
    );
    await tx.wait();
    return tx.hash;
  }

  private getContract(fromWallet?: Wallet) {
    return new ethers.Contract(
      this.stakingContractAddress,
      StakingContractAbi,
      fromWallet
        ? fromWallet.connect(this.ethersPolygonProvider)
        : this.ethersPolygonProvider
    );
  }
}
