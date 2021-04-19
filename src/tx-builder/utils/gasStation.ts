import { BigNumber } from 'ethers';
import { POLYGON_DEFAULT_GAS } from '../config';
import { transactionType, Configuration, Network } from '../types';

const DEFAULT_SURPLUS = 30; // 30%

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

export const estimateGasByNetwork = async (
  tx: transactionType,
  config: Configuration,
  gasSurplus?: number
): Promise<BigNumber> => {
  const estimatedGas = await config.provider.estimateGas(tx);

  const { network } = config;
  if (network === Network.polygon) {
    return POLYGON_DEFAULT_GAS;
  }

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
