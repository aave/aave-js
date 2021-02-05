import BigNumber from 'bignumber.js';
import { SECONDS_PER_YEAR } from '../helpers/constants';
import { BigNumberValue, valueToZDBigNumber } from '../helpers/bignumber';
import {
  RAY,
  rayMul,
  rayPow,
  binomialApproximatedRayPow,
  rayDiv,
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

  it.each`
    year | interest | errorLte
    ${1} | ${3}     | ${1}
    ${1} | ${5}     | ${1}
    ${1} | ${10}    | ${1}
    ${3} | ${3}     | ${3}
    ${3} | ${5}     | ${3}
    ${3} | ${10}    | ${3}
    ${5} | ${3}     | ${5}
    ${5} | ${5}     | ${5}
    ${5} | ${10}    | ${5}
  `(
    'should not be far off for big amounts and time spans',
    ({ year, interest, errorLte }) => {
      /**
       * We calculate the balance based on the last user interaction with that reserve.
       * For most users this happens multiple times a year, but for long holders we have to ensure the abbreviation is somewhat close.
       * This test showcases that it's:
       * < 0.00005% error in one year
       * < 0.0005% in 3 years
       * < 0.005% in 5 years
       */
      const rate = valueToZDBigNumber(
        Number.parseInt(interest) * 1000000000000000000000000
      );
      const balance = '100000000000000000000000000'; // 100M ETH
      const accurateInterest = legacyCalculateCompoundedInterest(
        rate,
        60 * 60 * 24 * 365 * Number.parseInt(year),
        0
      );
      const approximatedInterest = calculateCompoundedInterest(
        rate,
        valueToZDBigNumber(60 * 60 * 24 * 365 * Number.parseInt(year)),
        valueToZDBigNumber(0)
      );

      const accurateBalanceI = accurateInterest
        .multipliedBy(balance)
        .minus(balance);
      const approximatedBalanceI = approximatedInterest
        .multipliedBy(balance)
        .minus(balance);

      const diffPercentage = normalize(
        rayDiv(
          accurateBalanceI.minus(approximatedBalanceI),
          accurateBalanceI.multipliedBy(100)
        ),
        18
      );
      expect(Number.parseFloat(diffPercentage)).toBeLessThan(errorLte);
    }
  );
});
