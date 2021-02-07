import BigNumber from 'bignumber.js';

export type BigNumberValue = string | number | BigNumber;

export const BigNumberZD = BigNumber.clone({
  DECIMAL_PLACES: 0,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
});

export function valueToBigNumber(amount: BigNumberValue): BigNumber {
  if (BigNumber.isBigNumber(amount)) return amount;
  return new BigNumber(amount);
}
export function valueToZDBigNumber(amount: BigNumberValue): BigNumber {
  if (BigNumber.isBigNumber(amount))
    return amount.decimalPlaces(amount.decimalPlaces(), BigNumber.ROUND_DOWN);
  return new BigNumberZD(amount);
}
