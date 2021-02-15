import BigNumber from 'bignumber.js';

import {
  BigNumberValue,
  valueToBigNumber,
  valueToZDBigNumber,
  pow10,
} from './bignumber';
import * as RayMath from './ray-math';
import { SECONDS_PER_YEAR } from './constants';

export const LTV_PRECISION = 4;

export function calculateCompoundedInterest(
  rate: BigNumberValue,
  currentTimestamp: BigNumberValue,
  lastUpdateTimestamp: BigNumberValue
): BigNumber {
  const timeDelta = valueToZDBigNumber(currentTimestamp).minus(
    lastUpdateTimestamp
  );
  const ratePerSecond = valueToZDBigNumber(rate).dividedBy(SECONDS_PER_YEAR);
  return RayMath.rayPow(ratePerSecond.plus(RayMath.RAY), timeDelta);
}

export function getCompoundedBalance(
  _principalBalance: BigNumberValue,
  _reserveIndex: BigNumberValue,
  _reserveRate: BigNumberValue,
  _lastUpdateTimestamp: BigNumberValue,
  currentTimestamp: number
): BigNumber {
  const principalBalance = valueToZDBigNumber(_principalBalance);
  if (principalBalance.eq('0')) {
    return principalBalance;
  }

  const compoundedInterest = calculateCompoundedInterest(
    _reserveRate,
    currentTimestamp,
    _lastUpdateTimestamp
  );
  const cumulatedInterest = RayMath.rayMul(compoundedInterest, _reserveIndex);
  const principalBalanceRay = RayMath.wadToRay(principalBalance);

  return RayMath.rayToWad(
    RayMath.rayMul(principalBalanceRay, cumulatedInterest)
  );
}

export function getCompoundedStableBalance(
  _principalBalance: BigNumberValue,
  _userStableRate: BigNumberValue,
  _lastUpdateTimestamp: BigNumberValue,
  currentTimestamp: number
): BigNumber {
  const principalBalance = valueToZDBigNumber(_principalBalance);
  if (principalBalance.eq('0')) {
    return principalBalance;
  }

  const cumulatedInterest = calculateCompoundedInterest(
    _userStableRate,
    currentTimestamp,
    _lastUpdateTimestamp
  );
  const principalBalanceRay = RayMath.wadToRay(principalBalance);

  return RayMath.rayToWad(
    RayMath.rayMul(principalBalanceRay, cumulatedInterest)
  );
}

export function calculateHealthFactorFromBalances(
  collateralBalanceETH: BigNumberValue,
  borrowBalanceETH: BigNumberValue,
  currentLiquidationThreshold: BigNumberValue
): BigNumber {
  if (valueToBigNumber(borrowBalanceETH).eq(0)) {
    return valueToBigNumber('-1'); // invalid number
  }
  return valueToBigNumber(collateralBalanceETH)
    .multipliedBy(currentLiquidationThreshold)
    .dividedBy(pow10(LTV_PRECISION))
    .div(borrowBalanceETH);
}

export function calculateHealthFactorFromBalancesBigUnits(
  collateralBalanceETH: BigNumberValue,
  borrowBalanceETH: BigNumberValue,
  currentLiquidationThreshold: BigNumberValue
): BigNumber {
  return calculateHealthFactorFromBalances(
    collateralBalanceETH,
    borrowBalanceETH,
    new BigNumber(currentLiquidationThreshold)
      .multipliedBy(pow10(LTV_PRECISION))
      .decimalPlaces(0, BigNumber.ROUND_DOWN)
  );
}

export function calculateAvailableBorrowsETH(
  collateralBalanceETH: BigNumberValue,
  borrowBalanceETH: BigNumberValue,
  currentLtv: BigNumberValue
): BigNumber {
  if (valueToZDBigNumber(currentLtv).eq(0)) {
    return valueToZDBigNumber('0');
  }
  const availableBorrowsETH = valueToZDBigNumber(collateralBalanceETH)
    .multipliedBy(currentLtv)
    .dividedBy(pow10(LTV_PRECISION))
    .minus(borrowBalanceETH);
  return availableBorrowsETH.gt('0')
    ? availableBorrowsETH
    : valueToZDBigNumber('0');
}

export function calculateAverageRate(
  index0: string,
  index1: string,
  timestamp0: number,
  timestamp1: number
): string {
  return valueToBigNumber(index1)
    .dividedBy(index0)
    .minus('1')
    .dividedBy(timestamp1 - timestamp0)
    .multipliedBy(SECONDS_PER_YEAR)
    .toString();
}
