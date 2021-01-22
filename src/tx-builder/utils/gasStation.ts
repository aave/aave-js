import { BigNumber } from 'ethers';
import { transactionType, Configuration } from '../types';

// eslint-disable-next-line import/prefer-default-export
export const estimateGas = async (
  tx: transactionType,
  config: Configuration,
  gasSurplus?: number
): Promise<BigNumber> => {
  const estimatedGas = await config.provider.estimateGas(tx);
  return estimatedGas.add(estimatedGas.mul(gasSurplus || 10).div(100));
};
