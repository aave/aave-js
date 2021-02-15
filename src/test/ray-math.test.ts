import BigNumber from 'bignumber.js';
import { SECONDS_PER_YEAR } from '../helpers/constants';
import {
  BigNumberValue,
  valueToZDBigNumber,
  normalize,
} from '../helpers/bignumber';
import {
  RAY,
  rayMul,
  rayPow,
  binomialApproximatedRayPow,
  rayDiv,
} from '../helpers/ray-math';
import { calculateCompoundedInterest } from '../helpers/pool-math';

describe('wadMul should', () => {
  it('work correctly', () => {
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
    exponents                 | errorLte
    ${0}                      | ${0}
    ${60}                     | ${0.00001}
    ${60 * 60}                | ${0.00001}
    ${60 * 60 * 24}           | ${0.00001}
    ${60 * 60 * 24 * 31}      | ${0.00001}
    ${60 * 60 * 24 * 365}     | ${0.00001}
    ${60 * 60 * 24 * 365 * 2} | ${0.00002}
    ${60 * 60 * 24 * 365 * 5} | ${0.0003}
  `(
    'should have close results for varying exponents',
    ({ exponents, errorLte }) => {
      const result = rayPow(
        valueToZDBigNumber('10000000000000000000000000')
          .dividedBy(SECONDS_PER_YEAR)
          .plus(RAY),
        valueToZDBigNumber(exponents)
      );
      const approx = binomialApproximatedRayPow(
        valueToZDBigNumber('10000000000000000000000000').dividedBy(
          SECONDS_PER_YEAR
        ),
        valueToZDBigNumber(exponents)
      );

      const diff = result.gt(approx)
        ? result.minus(approx)
        : approx.minus(result);
      const diffPercentage = normalize(
        rayDiv(diff, result.multipliedBy(100)),
        24
      ).toString();
      expect(Math.abs(Number.parseFloat(diffPercentage))).toBeLessThanOrEqual(
        errorLte
      );
    }
  );

  it.each`
    years | interest | errorLte
    ${1}  | ${3}     | ${0.00001}
    ${1}  | ${5}     | ${0.00001}
    ${1}  | ${10}    | ${0.00001}
    ${3}  | ${3}     | ${0.00001}
    ${3}  | ${5}     | ${0.00001}
    ${3}  | ${10}    | ${0.00005}
    ${5}  | ${3}     | ${0.00001}
    ${5}  | ${5}     | ${0.00003}
    ${5}  | ${10}    | ${0.0003}
  `(
    'should not be far off for big amounts and time spans',
    ({ years, interest, errorLte }) => {
      /**
       * We calculate the balance based on the last user interaction with that reserve.
       * For most users this happens multiple times a year, but for long holders we have to ensure the abbreviation is somewhat close.
       * This test showcases that it's:
       * < 0.00005% error in one year
       * < 0.0005% in 3 years
       * < 0.005% in 5 years
       */
      const timeSpan = 60 * 60 * 24 * 365 * Number.parseInt(years);
      const rate = valueToZDBigNumber(
        Number.parseFloat(interest) * 1000000000000000000000000
      );
      const balance = '100000000000000000000000000'; // 100M ETH
      const accurateInterest = legacyCalculateCompoundedInterest(
        rate,
        timeSpan,
        0
      );
      const approximatedInterest = calculateCompoundedInterest(
        rate,
        timeSpan,
        0
      );

      const accurateBalanceI = accurateInterest
        .multipliedBy(balance)
        .minus(balance);
      const approximatedBalanceI = approximatedInterest
        .multipliedBy(balance)
        .minus(balance);

      const diff = accurateBalanceI.minus(approximatedBalanceI);
      const diffPercentage = normalize(
        rayDiv(diff, accurateBalanceI.multipliedBy(100)),
        24
      );
      expect(Math.abs(Number.parseFloat(diffPercentage))).toBeLessThanOrEqual(
        errorLte
      );
    }
  );

  it('should increase values over time', () => {
    const rate = valueToZDBigNumber(109284371694014197840985614);
    const ts1 = 2;
    const ts2 = 3;
    const accurateInterest1 = legacyCalculateCompoundedInterest(rate, ts1, 0);
    const approximatedInterest1 = calculateCompoundedInterest(rate, ts1, 0);
    const accurateInterest2 = legacyCalculateCompoundedInterest(rate, ts2, 0);
    const approximatedInterest2 = calculateCompoundedInterest(rate, ts2, 0);

    expect(accurateInterest1.lt(accurateInterest2)).toBe(true);
    expect(approximatedInterest1.lt(approximatedInterest2)).toBe(true);
  });
});
