import BigNumber from 'bignumber.js';

import * as RayMath from './helpers/ray-math';
import {
  ReserveData,
  ComputedUserReserve,
  UserReserveData,
  UserSummaryData,
  BorrowRateMode,
  ReserveRatesData,
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

  let cumulatedInterest;
  if (userReserve.borrowRateMode === BorrowRateMode.Variable) {
    let compoundedInterest = calculateCompoundedInterest(
      reserve.variableBorrowRate,
      currentTimestamp,
      reserve.lastUpdateTimestamp
    );

    cumulatedInterest = RayMath.rayDiv(
      RayMath.rayMul(compoundedInterest, reserve.variableBorrowIndex),
      userReserve.variableBorrowIndex
    );
  } else {
    // if stable
    cumulatedInterest = calculateCompoundedInterest(
      userReserve.borrowRate,
      currentTimestamp,
      userReserve.lastUpdateTimestamp
    );
  }

  const borrowBalanceRay = RayMath.wadToRay(principalBorrows);

  return RayMath.rayToWad(RayMath.rayMul(borrowBalanceRay, cumulatedInterest));
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
  currentLiquidationThreshold: BigNumberValue
): BigNumber {
  if (valueToBigNumber(borrowBalanceETH).eq(0)) {
    return valueToBigNumber('-1'); // invalid number
  }
  return valueToBigNumber(collateralBalanceETH)
    .multipliedBy(currentLiquidationThreshold)
    .dividedBy(100)
    .div(valueToBigNumber(borrowBalanceETH).plus(totalFeesETH));
}

export function calculateHealthFactorFromBalancesBigUnits(
  collateralBalanceETH: BigNumberValue,
  borrowBalanceETH: BigNumberValue,
  totalFeesETH: BigNumberValue,
  currentLiquidationThreshold: BigNumberValue
): BigNumber {
  return calculateHealthFactorFromBalances(
    collateralBalanceETH,
    borrowBalanceETH,
    totalFeesETH,
    new BigNumber(currentLiquidationThreshold)
      .multipliedBy(100)
      .decimalPlaces(0, BigNumber.ROUND_DOWN)
  );
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
      .decimalPlaces(0, BigNumber.ROUND_DOWN);
  }
  if (currentLiquidationThreshold.gt(0)) {
    currentLiquidationThreshold = currentLiquidationThreshold
      .div(totalCollateralETH)
      .decimalPlaces(0, BigNumber.ROUND_DOWN);
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

  const totalFeesUSD = totalFeesETH
    .multipliedBy(10 ** USD_DECIMALS)
    .dividedBy(usdPriceEth);

  const totalBorrowsWithFeesETH = totalFeesETH.plus(totalBorrowsETH);
  const totalBorrowsWithFeesUSD = totalFeesUSD.plus(totalBorrowsUSD);
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
      : totalBorrowsAndFeesETH
          .multipliedBy(100)
          .dividedBy(currentLiquidationThreshold)
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
    totalFeesUSD: totalFeesUSD.toString(),
    totalBorrowsWithFeesETH: totalBorrowsWithFeesETH.toString(),
    totalBorrowsWithFeesUSD: totalBorrowsWithFeesUSD.toString(),
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
    ({ reserve, ...userReserve }): ComputedUserReserve => {
      const reserveDecimals = reserve.decimals;
      return {
        ...userReserve,
        reserve: {
          ...reserve,
          reserveLiquidationBonus: normalize(
            valueToBigNumber(reserve.reserveLiquidationBonus).minus(100),
            2
          ),
          liquidityRate: normalize(reserve.liquidityRate, RAY_DECIMALS),
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
    totalFeesUSD: normalize(userData.totalFeesUSD, USD_DECIMALS),
    totalBorrowsETH: normalize(userData.totalBorrowsETH, ETH_DECIMALS),
    totalBorrowsUSD: normalize(userData.totalBorrowsUSD, USD_DECIMALS),
    totalBorrowsWithFeesETH: normalize(
      userData.totalBorrowsWithFeesETH,
      ETH_DECIMALS
    ),
    totalBorrowsWithFeesUSD: normalize(
      userData.totalBorrowsWithFeesUSD,
      USD_DECIMALS
    ),
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

export function calculateAverageRate(
  index0: string,
  index1: string,
  timestamp0: number,
  timestamp1: number
): string {
  return new BigNumber(index1)
    .dividedBy(index0)
    .minus('1')
    .dividedBy(timestamp1 - timestamp0)
    .multipliedBy('31536000')
    .toString();
}

export function formatReserves(
  reserves: ReserveData[],
  reserveIndexes30DaysAgo?: ReserveRatesData[]
): ReserveData[] {
  return reserves.map(reserve => {
    const reserve30DaysAgo = reserveIndexes30DaysAgo?.find(
      res => res.id === reserve.id
    )?.paramsHistory[0];

    return {
      ...reserve,
      price: {
        ...reserve.price,
        priceInEth: normalize(reserve.price.priceInEth, ETH_DECIMALS),
      },
      baseLTVasCollateral: normalize(reserve.baseLTVasCollateral, 2),
      variableBorrowRate: normalize(reserve.variableBorrowRate, RAY_DECIMALS),
      avg30DaysVariableBorrowRate: reserve30DaysAgo
        ? calculateAverageRate(
            reserve30DaysAgo.variableBorrowIndex,
            reserve.variableBorrowIndex,
            reserve30DaysAgo.timestamp,
            reserve.lastUpdateTimestamp
          )
        : undefined,
      avg30DaysLiquidityRate: reserve30DaysAgo
        ? calculateAverageRate(
            reserve30DaysAgo.liquidityIndex,
            reserve.liquidityIndex,
            reserve30DaysAgo.timestamp,
            reserve.lastUpdateTimestamp
          )
        : undefined,

      stableBorrowRate: normalize(reserve.stableBorrowRate, RAY_DECIMALS),
      liquidityRate: normalize(reserve.liquidityRate, RAY_DECIMALS),
      totalLiquidity: normalize(reserve.totalLiquidity, reserve.decimals),
      availableLiquidity: normalize(
        reserve.availableLiquidity,
        reserve.decimals
      ),
      liquidityIndex: normalize(reserve.liquidityIndex, RAY_DECIMALS),
      reserveLiquidationThreshold: normalize(
        reserve.reserveLiquidationThreshold,
        2
      ),
      reserveLiquidationBonus: normalize(
        valueToBigNumber(reserve.reserveLiquidationBonus).minus(100),
        2
      ),
      totalBorrows: normalize(reserve.totalBorrows, reserve.decimals),
      totalBorrowsVariable: normalize(
        reserve.totalBorrowsVariable,
        reserve.decimals
      ),
      totalBorrowsStable: normalize(
        reserve.totalBorrowsStable,
        reserve.decimals
      ),
      variableBorrowIndex: normalize(reserve.variableBorrowIndex, RAY_DECIMALS),
    };
  });
}

export function calculateInterestRates(
  reserve: ReserveData,
  amountToDeposit: BigNumberValue,
  amountToBorrow: BigNumberValue,
  borrowMode: 'stable' | 'variable' = 'variable'
) {
  const { optimalUtilisationRate } = reserve;
  const baseVariableBorrowRate = valueToBigNumber(
    reserve.baseVariableBorrowRate
  );
  const totalBorrowsStable = valueToBigNumber(reserve.totalBorrowsStable).plus(
    borrowMode === 'stable' ? amountToBorrow : '0'
  );
  const totalBorrowsVariable = valueToBigNumber(
    reserve.totalBorrowsVariable
  ).plus(borrowMode === 'variable' ? amountToBorrow : '0');
  const totalBorrows = totalBorrowsStable.plus(totalBorrowsVariable);
  const totalDeposits = valueToBigNumber(reserve.totalLiquidity).plus(
    amountToDeposit
  );
  const utilizationRate =
    totalDeposits.eq(0) && totalBorrows.eq(0)
      ? valueToBigNumber(0)
      : totalBorrows.dividedBy(totalDeposits);

  let currentStableBorrowRate = valueToBigNumber(reserve.stableBorrowRate);
  let currentVariableBorrowRate = valueToBigNumber(0);
  let currentLiquidityRate = valueToBigNumber(0);

  if (utilizationRate.gt(optimalUtilisationRate)) {
    const excessUtilizationRateRatio = utilizationRate
      .minus(optimalUtilisationRate)
      .dividedBy(valueToBigNumber(1).minus(optimalUtilisationRate));

    currentStableBorrowRate = currentStableBorrowRate
      .plus(reserve.stableRateSlope1)
      .plus(excessUtilizationRateRatio.multipliedBy(reserve.stableRateSlope2));
    currentVariableBorrowRate = baseVariableBorrowRate
      .plus(reserve.variableRateSlope1)
      .plus(
        excessUtilizationRateRatio.multipliedBy(reserve.variableRateSlope2)
      );
  } else {
    currentStableBorrowRate = currentVariableBorrowRate.plus(
      utilizationRate
        .dividedBy(optimalUtilisationRate)
        .multipliedBy(reserve.stableRateSlope1)
    );
    currentVariableBorrowRate = baseVariableBorrowRate.plus(
      utilizationRate
        .dividedBy(optimalUtilisationRate)
        .multipliedBy(reserve.variableRateSlope1)
    );
  }

  if (!totalBorrows.eq(0)) {
    const weightedVariableRate = currentVariableBorrowRate.multipliedBy(
      totalBorrowsVariable
    );
    const weightedStableRate = valueToBigNumber(
      reserve.averageStableBorrowRate
    ).multipliedBy(totalBorrowsStable);

    currentLiquidityRate = weightedVariableRate
      .plus(weightedStableRate)
      .dividedBy(totalBorrows);
  }

  return {
    variableBorrowRate: currentVariableBorrowRate.toString(),
    stableBorrowRate: currentStableBorrowRate.toString(),
    liquidityRate: currentLiquidityRate.toString(),
  };
}
