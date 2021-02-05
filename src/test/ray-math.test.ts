import BigNumber from 'bignumber.js';
import { SECONDS_PER_YEAR } from '../helpers/constants';
import { BigNumberValue, valueToZDBigNumber } from '../helpers/bignumber';
import {
  RAY,
  rayMul,
  rayPow,
  binomialApproximatedRayPow,
} from '../helpers/ray-math';
import { calculateCompoundedInterest, normalize } from '../helpers/pool-math';

describe('wadMul should', () => {
  it('works correct', () => {
    expect(rayMul(RAY, RAY).toString()).toEqual(RAY.toString());
  });
  it('not return decimal places', () => {
    expect(rayMul(new BigNumber(0.1).pow(30), RAY).decimalPlaces()).toEqual(0);
  });
  it('should round down', () => {
    expect(rayMul(new BigNumber(0.5).pow(27), RAY).toString()).toEqual('0');
  });
});

const legacyCalculateCompoundedInterest = (
  rate: BigNumberValue,
  currentTimestamp: number,
  lastUpdateTimestamp: number
): BigNumber => {
  const timeDelta = valueToZDBigNumber(currentTimestamp - lastUpdateTimestamp);
  const ratePerSecond = valueToZDBigNumber(rate).dividedBy(SECONDS_PER_YEAR);
  return rayPow(ratePerSecond.plus(RAY), timeDelta);
};

describe('rayPow and binomialApproximatedRayPow', () => {
  it('should be roughly equal', () => {
    const result = rayPow(
      valueToZDBigNumber('323788616402133497883602337')
        .dividedBy(SECONDS_PER_YEAR)
        .plus(RAY),
      valueToZDBigNumber(60 * 60 * 24)
    ).toString();
    const approx = binomialApproximatedRayPow(
      valueToZDBigNumber('323788616402133497883602337').dividedBy(
        SECONDS_PER_YEAR
      ),
      valueToZDBigNumber(60 * 60 * 24)
    ).toString();
    expect(result.substring(0, 8)).toEqual(approx.substring(0, 8));
  });

  it('should not be far off for big amounts and time spans', () => {
    /**
     * We calculate the balance based on the last user interaction.
     * This means, while it's very unlikely if someone deposited 100M and didn't touch it for 5years with and interest of 10% the error should be small.
     */
    const rate = valueToZDBigNumber('10000000000000000000000000'); // 10%
    const balance = '100000000000000000000000000'; // 100M ETH
    const accurateInterest = legacyCalculateCompoundedInterest(
      rate,
      60 * 60 * 24 * 365 * 5,
      0
    ).toString();
    const approximatedInterest = calculateCompoundedInterest(
      rate,
      valueToZDBigNumber(60 * 60 * 24 * 365 * 5),
      valueToZDBigNumber(0)
    ).toString();
    expect(accurateInterest.substr(0, 5)).toEqual(
      approximatedInterest.substr(0, 5)
    );
    const accurateBalance = normalize(rayMul(accurateInterest, balance), 18);
    const approximatedBalance = normalize(
      rayMul(approximatedInterest, balance),
      18
    );
    expect(
      Math.abs(
        Number.parseFloat(accurateBalance) -
          Number.parseFloat(approximatedBalance)
      )
    ).toBeLessThan(10000);
  });
});
