import BigNumber from 'bignumber.js';

export type BigNumberValue = string | number | BigNumber;

export const BigNumberZD = BigNumber.clone({
  DECIMAL_PLACES: 0,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
});

export function valueToBigNumber(amount: BigNumberValue): BigNumber {
  return new BigNumber(amount);
}
export function valueToZDBigNumber(amount: BigNumberValue): BigNumber {
  return new BigNumberZD(amount);
}
