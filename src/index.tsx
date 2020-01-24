import BigNumber from 'bignumber.js';

import * as RayMath from './helpers/ray-math';
import {
  ReserveData,
  ComputedUserReserve,
  UserReserveData,
  UserSummaryData,
  BorrowRateMode,
} from './types';
import {
  BigNumberValue,
  valueToBigNumber,
  valueToZDBigNumber,
} from './helpers/bignumber';

export function normalize(n: BigNumberValue, decimals: number): string {
  return new BigNumber(n)
    .dividedBy(new BigNumber('10').pow(decimals))
    .toString();
}

const SECONDS_PER_YEAR = valueToBigNumber('31536000');
const ETH_DECIMALS = 18;
const USD_DECIMALS = 10;
const RAY_DECIMALS = 27;

function getCompoundedBorrowBalance(
  reserve: ReserveData,
  userReserve: UserReserveData,
  currentTimestamp: number
): BigNumber {
  const principalBorrows = valueToZDBigNumber(userReserve.principalBorrows);
  if (principalBorrows.eq('0')) {
    return valueToZDBigNumber('0');
  }

  let cumulatedInterest = calculateCompoundedInterest(
    userReserve.borrowRate,
    currentTimestamp,
    userReserve.lastUpdateTimestamp
  );

  const borrowBalanceRay = RayMath.wadToRay(principalBorrows);

  if (userReserve.borrowRateMode === BorrowRateMode.Variable) {
    cumulatedInterest = RayMath.rayDiv(
      RayMath.rayMul(cumulatedInterest, reserve.variableBorrowIndex),
      userReserve.variableBorrowIndex
    );
  }

  return RayMath.rayToWad(
    RayMath.rayMul(borrowBalanceRay, cumulatedInterest)
  ).plus(userReserve.originationFee);
}

const calculateCompoundedInterest = (
  rate: BigNumberValue,
  currentTimestamp: number,
  lastUpdateTimestamp: number
): BigNumber => {
  const timeDelta = valueToZDBigNumber(currentTimestamp - lastUpdateTimestamp);
  const ratePerSecond = valueToZDBigNumber(rate).dividedBy(SECONDS_PER_YEAR);
  return RayMath.rayPow(ratePerSecond.plus(RayMath.RAY), timeDelta);
};

const calculateLinearInterest = (
  rate: BigNumberValue,
  currentTimestamp: number,
  lastUpdateTimestamp: number
) => {
  const timeDelta = RayMath.wadToRay(
    valueToZDBigNumber(currentTimestamp - lastUpdateTimestamp)
  );
  const timeDeltaInSeconds = RayMath.rayDiv(
    timeDelta,
    RayMath.wadToRay(SECONDS_PER_YEAR)
  );
  return RayMath.rayMul(rate, timeDeltaInSeconds).plus(RayMath.RAY);
};

export function calculateHealthFactorFromBalances(
  collateralBalanceETH: BigNumberValue,
  borrowBalanceETH: BigNumberValue,
  totalFeesETH: BigNumberValue,
  currentLiquidationThreshold: BigNumber
): BigNumber {
  if (valueToBigNumber(borrowBalanceETH).eq(0)) {
    return valueToBigNumber('-1'); // invalid number
  }
  return valueToBigNumber(collateralBalanceETH)
    .multipliedBy(currentLiquidationThreshold)
    .dividedBy(100)
    .div(valueToBigNumber(borrowBalanceETH).plus(totalFeesETH));
}

function calculateAvailableBorrowsETH(
  collateralBalanceETH: BigNumberValue,
  borrowBalanceETH: BigNumberValue,
  totalFeesETH: BigNumberValue,
  currentLtv: BigNumberValue
): BigNumber {
  if (valueToZDBigNumber(currentLtv).eq(0)) {
    return valueToZDBigNumber('0');
  }
  let availableBorrowsETH = valueToZDBigNumber(collateralBalanceETH)
    .multipliedBy(currentLtv)
    .dividedBy(100);
  if (availableBorrowsETH.lt(borrowBalanceETH)) {
    return valueToZDBigNumber('0');
  }
  availableBorrowsETH = availableBorrowsETH
    .minus(borrowBalanceETH)
    .minus(totalFeesETH);
  const borrowFee = availableBorrowsETH.multipliedBy('0.0025');
  return availableBorrowsETH.minus(borrowFee);
}

function getReserveNormalizedIncome(
  reserve: ReserveData,
  currentTimestamp: number
): BigNumber {
  const { liquidityRate, liquidityIndex, lastUpdateTimestamp } = reserve;
  if (valueToZDBigNumber(liquidityRate).eq('0')) {
    return valueToZDBigNumber(liquidityIndex);
  }

  const cumulatedInterest = calculateLinearInterest(
    liquidityRate,
    currentTimestamp,
    lastUpdateTimestamp
  );

  return RayMath.rayMul(cumulatedInterest, liquidityIndex);
}

function calculateCumulatedBalance(
  balance: BigNumberValue,
  userReserve: UserReserveData,
  poolReserve: ReserveData,
  currentTimestamp: number
): BigNumber {
  return RayMath.rayToWad(
    RayMath.rayDiv(
      RayMath.rayMul(
        RayMath.wadToRay(balance),
        getReserveNormalizedIncome(poolReserve, currentTimestamp)
      ),
      userReserve.userBalanceIndex
    )
  );
}

function calculateCurrentUnderlyingBalance(
  userReserve: UserReserveData,
  poolReserve: ReserveData,
  currentTimestamp: number
): BigNumber {
  if (
    userReserve.principalATokenBalance === '0' &&
    userReserve.redirectedBalance === '0'
  ) {
    return valueToZDBigNumber('0');
  }
  if (
    userReserve.interestRedirectionAddress !==
    '0x0000000000000000000000000000000000000000'
  ) {
    return valueToZDBigNumber(userReserve.principalATokenBalance).plus(
      calculateCumulatedBalance(
        userReserve.redirectedBalance,
        userReserve,
        poolReserve,
        currentTimestamp
      ).minus(userReserve.redirectedBalance)
    );
  }
  return calculateCumulatedBalance(
    valueToBigNumber(userReserve.redirectedBalance)
      .plus(userReserve.principalATokenBalance)
      .toString(),
    userReserve,
    poolReserve,
    currentTimestamp
  ).minus(userReserve.redirectedBalance);
}

function computeUserReserveData(
  poolReserve: ReserveData,
  userReserve: UserReserveData,
  usdPriceEth: BigNumberValue,
  currentTimestamp: number
): ComputedUserReserve {
  const {
    price: { priceInEth },
    decimals,
  } = poolReserve;
  const currentUnderlyingBalance = calculateCurrentUnderlyingBalance(
    userReserve,
    poolReserve,
    currentTimestamp
  );
  const currentUnderlyingBalanceETH = currentUnderlyingBalance
    .multipliedBy(priceInEth)
    .dividedBy(10 ** decimals);
  const currentUnderlyingBalanceUSD = currentUnderlyingBalanceETH
    .multipliedBy(10 ** USD_DECIMALS)
    .dividedBy(usdPriceEth)
    .toFixed(0);

  const principalBorrowsETH = valueToZDBigNumber(userReserve.principalBorrows)
    .multipliedBy(priceInEth)
    .dividedBy(10 ** decimals);
  const principalBorrowsUSD = principalBorrowsETH
    .multipliedBy(10 ** USD_DECIMALS)
    .dividedBy(usdPriceEth)
    .toFixed(0);

  const currentBorrows = getCompoundedBorrowBalance(
    poolReserve,
    userReserve,
    currentTimestamp
  );
  const currentBorrowsETH = currentBorrows
    .multipliedBy(priceInEth)
    .dividedBy(10 ** decimals);
  const currentBorrowsUSD = currentBorrowsETH
    .multipliedBy(10 ** USD_DECIMALS)
    .dividedBy(usdPriceEth)
    .toFixed(0);

  const originationFeeETH = valueToZDBigNumber(userReserve.originationFee)
    .multipliedBy(priceInEth)
    .dividedBy(10 ** decimals);
  const originationFeeUSD = originationFeeETH
    .multipliedBy(10 ** USD_DECIMALS)
    .dividedBy(usdPriceEth)
    .toFixed(0);

  return {
    ...userReserve,
    principalBorrowsUSD,
    currentBorrowsUSD,
    originationFeeUSD,
    currentUnderlyingBalanceUSD,
    originationFeeETH: originationFeeETH.toString(),
    currentBorrows: currentBorrows.toString(),
    currentBorrowsETH: currentBorrowsETH.toString(),
    principalBorrowsETH: principalBorrowsETH.toString(),
    currentUnderlyingBalance: currentUnderlyingBalance.toFixed(),
    currentUnderlyingBalanceETH: currentUnderlyingBalanceETH.toFixed(),
  };
}

export function computeRawUserSummaryData(
  poolReservesData: ReserveData[],
  rawUserReserves: UserReserveData[],
  userId: string,
  usdPriceEth: BigNumberValue,
  currentTimestamp: number
): UserSummaryData {
  let totalLiquidityETH = valueToZDBigNumber('0');
  let totalCollateralETH = valueToZDBigNumber('0');
  let totalBorrowsETH = valueToZDBigNumber('0');
  let totalFeesETH = valueToZDBigNumber('0');
  let currentLtv = valueToBigNumber('0');
  let currentLiquidationThreshold = valueToBigNumber('0');

  const userReservesData = rawUserReserves
    .map(userReserve => {
      const poolReserve = poolReservesData.find(
        reserve => reserve.id === userReserve.reserve.id
      );
      if (!poolReserve) {
        throw new Error(
          'Reserve is not registered on platform, please contact support'
        );
      }
      const computedUserReserve = computeUserReserveData(
        poolReserve,
        userReserve,
        usdPriceEth,
        currentTimestamp
      );
      totalLiquidityETH = totalLiquidityETH.plus(
        computedUserReserve.currentUnderlyingBalanceETH
      );
      totalBorrowsETH = totalBorrowsETH.plus(
        computedUserReserve.currentBorrowsETH
      );
      totalFeesETH = totalFeesETH.plus(computedUserReserve.originationFeeETH);

      // asset enabled as collateral
      if (
        poolReserve.usageAsCollateralEnabled &&
        userReserve.usageAsCollateralEnabledOnUser
      ) {
        totalCollateralETH = totalCollateralETH.plus(
          computedUserReserve.currentUnderlyingBalanceETH
        );
        currentLtv = currentLtv.plus(
          valueToBigNumber(
            computedUserReserve.currentUnderlyingBalanceETH
          ).multipliedBy(poolReserve.baseLTVasCollateral)
        );
        currentLiquidationThreshold = currentLiquidationThreshold.plus(
          valueToBigNumber(
            computedUserReserve.currentUnderlyingBalanceETH
          ).multipliedBy(poolReserve.reserveLiquidationThreshold)
        );
      }
      return computedUserReserve;
    })
    .sort((a, b) =>
      a.reserve.symbol > b.reserve.symbol
        ? 1
        : a.reserve.symbol < b.reserve.symbol
        ? -1
        : 0
    );

  if (currentLtv.gt(0)) {
    currentLtv = currentLtv
      .div(totalCollateralETH)
      .decimalPlaces(2, BigNumber.ROUND_DOWN);
  }
  if (currentLiquidationThreshold.gt(0)) {
    currentLiquidationThreshold = currentLiquidationThreshold
      .div(totalCollateralETH)
      .decimalPlaces(2, BigNumber.ROUND_DOWN);
  }

  const healthFactor = calculateHealthFactorFromBalances(
    totalCollateralETH,
    totalBorrowsETH,
    totalFeesETH,
    currentLiquidationThreshold
  );

  const totalCollateralUSD = totalCollateralETH
    .multipliedBy(10 ** USD_DECIMALS)
    .dividedBy(usdPriceEth)
    .toString();

  const totalLiquidityUSD = totalLiquidityETH
    .multipliedBy(10 ** USD_DECIMALS)
    .dividedBy(usdPriceEth)
    .toString();

  const totalBorrowsUSD = totalBorrowsETH
    .multipliedBy(10 ** USD_DECIMALS)
    .dividedBy(usdPriceEth)
    .toString();
  const availableBorrowsETH = calculateAvailableBorrowsETH(
    totalCollateralETH,
    totalBorrowsETH,
    totalFeesETH,
    currentLtv
  );

  const totalBorrowsAndFeesETH = totalBorrowsETH.plus(totalFeesETH);
  const maxAmountToWithdrawInEth = totalLiquidityETH.minus(
    totalBorrowsAndFeesETH.eq(0)
      ? '0'
      : totalBorrowsAndFeesETH.dividedBy(currentLiquidationThreshold)
  );

  return {
    totalLiquidityUSD,
    totalCollateralUSD,
    totalBorrowsUSD,
    id: userId,
    totalLiquidityETH: totalLiquidityETH.toString(),
    totalCollateralETH: totalCollateralETH.toString(),
    totalFeesETH: totalFeesETH.toString(),
    totalBorrowsETH: totalBorrowsETH.toString(),
    availableBorrowsETH: availableBorrowsETH.toString(),
    currentLoanToValue: currentLtv.toString(),
    currentLiquidationThreshold: currentLiquidationThreshold.toString(),
    maxAmountToWithdrawInEth: maxAmountToWithdrawInEth.toString(),
    healthFactor: healthFactor.toString(),
    reservesData: userReservesData,
  };
}

export function formatUserSummaryData(
  poolReservesData: ReserveData[],
  rawUserReserves: UserReserveData[],
  userId: string,
  usdPriceEth: BigNumberValue,
  currentTimestamp: number
): UserSummaryData {
  const userData = computeRawUserSummaryData(
    poolReservesData,
    rawUserReserves,
    userId,
    usdPriceEth,
    currentTimestamp
  );
  const userReservesData = userData.reservesData.map(
    (userReserve): ComputedUserReserve => {
      const poolReserve = poolReservesData.find(
        reserve => reserve.id === userReserve.reserve.id
      );
      const reserveDecimals = poolReserve?.decimals || 18;
      return {
        ...userReserve,
        reserve: {
          ...userReserve.reserve,
          liquidityRate: normalize(
            userReserve.reserve.liquidityRate,
            RAY_DECIMALS
          ),
        },
        redirectedBalance: normalize(
          userReserve.redirectedBalance,
          reserveDecimals
        ),
        principalATokenBalance: normalize(
          userReserve.principalATokenBalance,
          reserveDecimals
        ),
        borrowRate: normalize(userReserve.borrowRate, RAY_DECIMALS),
        lastUpdateTimestamp: userReserve.lastUpdateTimestamp,
        variableBorrowIndex: normalize(
          userReserve.variableBorrowIndex,
          RAY_DECIMALS
        ),
        userBalanceIndex: normalize(userReserve.userBalanceIndex, RAY_DECIMALS),
        currentUnderlyingBalance: normalize(
          userReserve.currentUnderlyingBalance,
          reserveDecimals
        ),
        currentUnderlyingBalanceETH: normalize(
          userReserve.currentUnderlyingBalanceETH,
          ETH_DECIMALS
        ),
        currentUnderlyingBalanceUSD: normalize(
          userReserve.currentUnderlyingBalanceUSD,
          USD_DECIMALS
        ),
        principalBorrows: normalize(
          userReserve.principalBorrows,
          reserveDecimals
        ),
        principalBorrowsETH: normalize(
          userReserve.principalBorrowsETH,
          ETH_DECIMALS
        ),
        principalBorrowsUSD: normalize(
          userReserve.principalBorrowsUSD,
          USD_DECIMALS
        ),
        currentBorrows: normalize(userReserve.currentBorrows, reserveDecimals),
        currentBorrowsETH: normalize(
          userReserve.currentBorrowsETH,
          ETH_DECIMALS
        ),
        currentBorrowsUSD: normalize(
          userReserve.currentBorrowsUSD,
          USD_DECIMALS
        ),
        originationFee: normalize(userReserve.originationFee, reserveDecimals),
        originationFeeETH: normalize(
          userReserve.originationFeeETH,
          ETH_DECIMALS
        ),
        originationFeeUSD: normalize(
          userReserve.originationFeeUSD,
          USD_DECIMALS
        ),
      };
    }
  );
  return {
    id: userData.id,
    reservesData: userReservesData,
    totalLiquidityETH: normalize(userData.totalLiquidityETH, ETH_DECIMALS),
    totalLiquidityUSD: normalize(userData.totalLiquidityUSD, USD_DECIMALS),
    totalCollateralETH: normalize(userData.totalCollateralETH, ETH_DECIMALS),
    totalCollateralUSD: normalize(userData.totalCollateralUSD, USD_DECIMALS),
    totalFeesETH: normalize(userData.totalFeesETH, ETH_DECIMALS),
    totalBorrowsETH: normalize(userData.totalBorrowsETH, ETH_DECIMALS),
    totalBorrowsUSD: normalize(userData.totalBorrowsUSD, USD_DECIMALS),
    availableBorrowsETH: normalize(userData.availableBorrowsETH, ETH_DECIMALS),
    currentLoanToValue: normalize(userData.currentLoanToValue, 2),
    currentLiquidationThreshold: normalize(
      userData.currentLiquidationThreshold,
      2
    ),
    maxAmountToWithdrawInEth: normalize(
      userData.maxAmountToWithdrawInEth,
      ETH_DECIMALS
    ),
    healthFactor: userData.healthFactor,
  };
}

export function formatReserves(reserves: ReserveData[]): ReserveData[] {
  return reserves.map(reserve => ({
    ...reserve,
    price: {
      ...reserve.price,
      priceInEth: normalize(reserve.price.priceInEth, ETH_DECIMALS),
    },
    baseLTVasCollateral: normalize(reserve.baseLTVasCollateral, 2),
    variableBorrowRate: normalize(reserve.variableBorrowRate, RAY_DECIMALS),
    stableBorrowRate: normalize(reserve.stableBorrowRate, RAY_DECIMALS),
    liquidityRate: normalize(reserve.liquidityRate, RAY_DECIMALS),
    totalLiquidity: normalize(reserve.totalLiquidity, reserve.decimals),
    availableLiquidity: normalize(reserve.availableLiquidity, reserve.decimals),
    liquidityIndex: normalize(reserve.liquidityIndex, RAY_DECIMALS),
    reserveLiquidationThreshold: normalize(
      reserve.reserveLiquidationThreshold,
      2
    ),
    totalBorrows: normalize(reserve.totalBorrows, reserve.decimals),
    totalBorrowsVariable: normalize(
      reserve.totalBorrowsVariable,
      reserve.decimals
    ),
    totalBorrowsStable: normalize(reserve.totalBorrowsStable, reserve.decimals),
    variableBorrowIndex: normalize(reserve.variableBorrowIndex, RAY_DECIMALS),
  }));
}
