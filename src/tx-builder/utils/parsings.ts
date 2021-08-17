import BigNumber from 'bignumber.js';
import {
  API_ETH_MOCK_ADDRESS,
  DEFAULT_NULL_VALUE_ON_TX,
  uniswapEthAmount,
} from '../config';
import { tStringDecimalUnits } from '../types';

export const parseNumber = (value: string, decimals: number): string => {
  return new BigNumber(value)
    .multipliedBy(new BigNumber(10).pow(decimals))
    .toFixed(0);
};

export const decimalsToCurrencyUnits = (
  value: string,
  decimals: number
): string =>
  new BigNumber(value).div(new BigNumber(10).pow(decimals)).toFixed();

export const getTxValue = (reserve: string, amount: string): string => {
  return reserve.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase()
    ? amount
    : DEFAULT_NULL_VALUE_ON_TX;
};

export const mintAmountsPerToken: { [token: string]: tStringDecimalUnits } = {
  AAVE: parseNumber('100', 18),
  BAT: parseNumber('100000', 18),
  BUSD: parseNumber('10000', 18),
  DAI: parseNumber('10000', 18),
  ENJ: parseNumber('100000', 18),
  KNC: parseNumber('10000', 18),
  LEND: parseNumber('1000', 18), // Not available on v2, but to support v1 faucet
  LINK: parseNumber('1000', 18),
  MANA: parseNumber('100000', 18),
  MKR: parseNumber('10', 18),
  WETH: parseNumber('10', 18),
  REN: parseNumber('10000', 18),
  REP: parseNumber('1000', 18),
  SNX: parseNumber('100', 18),
  SUSD: parseNumber('10000', 18),
  TUSD: '0', // The TusdMinter contract already mints the maximum
  UNI: parseNumber('1000', 18),
  USDC: parseNumber('10000', 6),
  USDT: parseNumber('10000', 6),
  WBTC: parseNumber('1', 8),
  YFI: parseNumber('1', 18),
  ZRX: parseNumber('100000', 18),
  UNIUSDC: parseNumber(uniswapEthAmount, 6),
  UNIDAI: parseNumber(uniswapEthAmount, 18),
  UNIUSDT: parseNumber(uniswapEthAmount, 6),
  UNIDAIETH: parseNumber(uniswapEthAmount, 18),
  UNIUSDCETH: parseNumber(uniswapEthAmount, 18),
  UNISETHETH: parseNumber(uniswapEthAmount, 18),
  UNILENDETH: parseNumber(uniswapEthAmount, 18),
  UNILINKETH: parseNumber(uniswapEthAmount, 18),
  UNIMKRETH: parseNumber(uniswapEthAmount, 18),
};

export const canBeEnsAddress = (ensAddress: string): boolean => {
  return ensAddress.toLowerCase().endsWith('.eth');
};
