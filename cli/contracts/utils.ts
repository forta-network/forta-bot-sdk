import { Wallet, ethers } from "ethers";

export async function getTxOptions(
  gasLimit: ethers.BigNumber,
  fromWallet: Wallet
) {
  const GAS_MULTIPLIER = 1.15;
  const GAS_PRICE_MULTIPLIER = 1.5;
  const gasPrice = await fromWallet.getGasPrice();
  return {
    gasLimit: Math.round(gasLimit.toNumber() * GAS_MULTIPLIER),
    gasPrice: Math.round(gasPrice.toNumber() * GAS_PRICE_MULTIPLIER),
  };
}
