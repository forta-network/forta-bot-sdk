import { BigNumber, Wallet, ethers, providers } from "ethers";
import FortTokenAbi from "./fort.token.abi.json";
import { getTxOptions } from "./utils";

const FALLBACK_APPROVE_GAS_LIMIT = BigNumber.from(52_000);

export default class FortToken {
  constructor(
    private ethersPolygonProvider: providers.JsonRpcProvider,
    private fortTokenAddress: string
  ) {}

  async balanceOf(wallet: Wallet): Promise<BigNumber> {
    return this.getContract().balanceOf(wallet.address);
  }

  async allowance(wallet: Wallet, spender: string): Promise<BigNumber> {
    return this.getContract().allowance(wallet.address, spender);
  }

  async approve(fromWallet: Wallet, spender: string, amount: BigNumber) {
    const contract = this.getContract(fromWallet);
    let gas = FALLBACK_APPROVE_GAS_LIMIT;
    try {
      gas = await contract.estimateGas.approve(spender, amount);
    } catch (e) {
      console.log(
        `unable to estimate gas for approve, using fallback gas limit (${gas})`
      );
    }
    const txOptions = await getTxOptions(
      gas,
      fromWallet.connect(this.ethersPolygonProvider)
    );
    const tx = await contract.approve(spender, amount, txOptions);
    await tx.wait();
    return tx.hash;
  }

  private getContract(fromWallet?: Wallet) {
    return new ethers.Contract(
      this.fortTokenAddress,
      FortTokenAbi,
      fromWallet
        ? fromWallet.connect(this.ethersPolygonProvider)
        : this.ethersPolygonProvider
    );
  }
}
