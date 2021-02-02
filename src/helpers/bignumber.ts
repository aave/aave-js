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

const bn10 = new BigNumber(10);

const bn10PowLookup: { [key: number]: BigNumberValue } = {};

function pow10(decimals: number) {
  if (!bn10PowLookup[decimals]) bn10PowLookup[decimals] = bn10.pow(decimals);
  return bn10PowLookup[decimals];
}

export function normalize(n: BigNumberValue, decimals: number): string {
  return new BigNumber(n).dividedBy(pow10(decimals)).toString(10);
}
