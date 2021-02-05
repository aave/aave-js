import BigNumber from 'bignumber.js';
import { SECONDS_PER_YEAR } from '../helpers/constants';
import { valueToZDBigNumber } from '../helpers/bignumber';
import {
  RAY,
  rayMul,
  rayPow,
  binomialApproximatedRayPow,
} from '../helpers/ray-math';

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

describe('rayPow', () => {
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
});
