import { BigNumber } from 'ethers';
import { transactionType, Configuration } from '../types';

const DEFAULT_SURPLUS = 15; // 15%

export const estimateGas = async (
  tx: transactionType,
  config: Configuration,
  gasSurplus?: number
): Promise<BigNumber> => {
  const estimatedGas = await config.provider.estimateGas(tx);
  return estimatedGas.add(
    estimatedGas.mul(gasSurplus || DEFAULT_SURPLUS).div(100)
  );
};

export const getGasPrice = async (
  config: Configuration
): Promise<BigNumber> => {
  const gasPrice = await config.provider.getGasPrice();
  return gasPrice;
};
