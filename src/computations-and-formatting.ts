import BigNumber from 'bignumber.js';

import {
  BigNumberValue,
  valueToBigNumber,
  valueToZDBigNumber,
} from './helpers/bignumber';
import {
  calculateAvailableBorrowsETH,
  calculateHealthFactorFromBalances,
  getCompoundedBalance,
  getCompoundedStableBalance,
  normalize,
  calculateAverageRate,
  LTV_PRECISION,
} from './helpers/pool-math';
import {
  ComputedUserReserve,
  ReserveData,
  UserReserveData,
  UserSummaryData,
  ReserveRatesData,
} from './types';

const ETH_DECIMALS = 18;
const USD_DECIMALS = 10;
const RAY_DECIMALS = 27;

function getEthAndUsdBalance(
  balance: BigNumberValue,
  priceInEth: BigNumberValue,
  decimals: number,
  usdPriceEth: BigNumberValue
): [string, string] {
  const balanceInEth = valueToZDBigNumber(balance)
    .multipliedBy(priceInEth)
    .dividedBy(10 ** decimals);
  const balanceInUsd = balanceInEth
    .multipliedBy(10 ** USD_DECIMALS)
    .dividedBy(usdPriceEth)
    .toFixed(0);
  return [balanceInEth.toString(), balanceInUsd];
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
  const underlyingBalance = getCompoundedBalance(
    userReserve.principalATokenBalance,
    poolReserve.liquidityIndex,
    poolReserve.liquidityRate,
    poolReserve.lastUpdateTimestamp,
    currentTimestamp
  )
    .multipliedBy(
      valueToZDBigNumber(LTV_PRECISION).minus(poolReserve.reserveFactor)
    )
    .dividedBy(LTV_PRECISION)
    .toString();
  const [underlyingBalanceETH, underlyingBalanceUSD] = getEthAndUsdBalance(
    underlyingBalance,
    priceInEth,
    decimals,
    usdPriceEth
  );

  const variableBorrows = getCompoundedBalance(
    userReserve.principalVariableBorrows,
    poolReserve.variableBorrowIndex,
    poolReserve.variableBorrowRate,
    poolReserve.lastUpdateTimestamp,
    currentTimestamp
  ).toString();

  const [variableBorrowsETH, variableBorrowsUSD] = getEthAndUsdBalance(
    variableBorrows,
    priceInEth,
    decimals,
    usdPriceEth
  );

  const stableBorrows = getCompoundedStableBalance(
    userReserve.principalStableBorrows,
    userReserve.stableBorrowRate,
    userReserve.lastStableBorrowsUpdateTimestamp,
    currentTimestamp
  ).toString();

  const [stableBorrowsETH, stableBorrowsUSD] = getEthAndUsdBalance(
    stableBorrows,
    priceInEth,
    decimals,
    usdPriceEth
  );

  return {
    ...userReserve,
    underlyingBalance,
    underlyingBalanceETH,
    underlyingBalanceUSD,
    variableBorrows,
    variableBorrowsETH,
    variableBorrowsUSD,
    stableBorrows,
    stableBorrowsETH,
    stableBorrowsUSD,
    totalBorrows: valueToZDBigNumber(variableBorrows)
      .plus(stableBorrows)
      .toString(),
    totalBorrowsETH: valueToZDBigNumber(variableBorrowsETH)
      .plus(stableBorrowsETH)
      .toString(),
    totalBorrowsUSD: valueToZDBigNumber(variableBorrowsUSD)
      .plus(stableBorrowsUSD)
      .toString(),
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
        computedUserReserve.underlyingBalanceETH
      );
      totalBorrowsETH = totalBorrowsETH
        .plus(computedUserReserve.variableBorrowsETH)
        .plus(computedUserReserve.stableBorrowsETH);

      // asset enabled as collateral
      if (
        poolReserve.usageAsCollateralEnabled &&
        userReserve.usageAsCollateralEnabledOnUser
      ) {
        totalCollateralETH = totalCollateralETH.plus(
          computedUserReserve.underlyingBalanceETH
        );
        currentLtv = currentLtv.plus(
          valueToBigNumber(
            computedUserReserve.underlyingBalanceETH
          ).multipliedBy(poolReserve.baseLTVasCollateral)
        );
        currentLiquidationThreshold = currentLiquidationThreshold.plus(
          valueToBigNumber(
            computedUserReserve.underlyingBalanceETH
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
    currentLtv
  );

  return {
    totalLiquidityUSD,
    totalCollateralUSD,
    totalBorrowsUSD,
    id: userId,
    totalLiquidityETH: totalLiquidityETH.toString(),
    totalCollateralETH: totalCollateralETH.toString(),
    totalBorrowsETH: totalBorrowsETH.toString(),
    availableBorrowsETH: availableBorrowsETH.toString(),
    currentLoanToValue: currentLtv.toString(),
    currentLiquidationThreshold: currentLiquidationThreshold.toString(),
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
    ({ reserve, ...userReserve }): ComputedUserReserve => {
      const reserveDecimals = reserve.decimals;
      return {
        ...userReserve,
        reserve: {
          ...reserve,
          reserveLiquidationBonus: normalize(
            valueToBigNumber(reserve.reserveLiquidationBonus).minus(
              LTV_PRECISION
            ),
            4
          ),
          liquidityRate: normalize(reserve.liquidityRate, RAY_DECIMALS),
        },
        principalATokenBalance: normalize(
          userReserve.principalATokenBalance,
          reserveDecimals
        ),
        stableBorrowRate: normalize(userReserve.stableBorrowRate, RAY_DECIMALS),
        lastStableBorrowsUpdateTimestamp:
          userReserve.lastStableBorrowsUpdateTimestamp,
        variableBorrowIndex: normalize(
          userReserve.variableBorrowIndex,
          RAY_DECIMALS
        ),
        userBalanceIndex: normalize(userReserve.userBalanceIndex, RAY_DECIMALS),
        underlyingBalance: normalize(
          userReserve.underlyingBalance,
          reserveDecimals
        ),
        underlyingBalanceETH: normalize(
          userReserve.underlyingBalanceETH,
          ETH_DECIMALS
        ),
        underlyingBalanceUSD: normalize(
          userReserve.underlyingBalanceUSD,
          USD_DECIMALS
        ),
        stableBorrows: normalize(userReserve.stableBorrows, reserveDecimals),
        stableBorrowsETH: normalize(userReserve.stableBorrowsETH, ETH_DECIMALS),
        stableBorrowsUSD: normalize(userReserve.stableBorrowsUSD, USD_DECIMALS),
        variableBorrows: normalize(
          userReserve.variableBorrows,
          reserveDecimals
        ),
        variableBorrowsETH: normalize(
          userReserve.variableBorrowsETH,
          ETH_DECIMALS
        ),
        variableBorrowsUSD: normalize(
          userReserve.variableBorrowsUSD,
          USD_DECIMALS
        ),
        totalBorrows: normalize(userReserve.totalBorrows, reserveDecimals),
        totalBorrowsETH: normalize(userReserve.totalBorrowsETH, ETH_DECIMALS),
        totalBorrowsUSD: normalize(userReserve.totalBorrowsUSD, USD_DECIMALS),
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
    totalBorrowsETH: normalize(userData.totalBorrowsETH, ETH_DECIMALS),
    totalBorrowsUSD: normalize(userData.totalBorrowsUSD, USD_DECIMALS),
    availableBorrowsETH: normalize(userData.availableBorrowsETH, ETH_DECIMALS),
    currentLoanToValue: normalize(userData.currentLoanToValue, 4),
    currentLiquidationThreshold: normalize(
      userData.currentLiquidationThreshold,
      4
    ),
    healthFactor: userData.healthFactor,
  };
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
      baseLTVasCollateral: normalize(
        reserve.baseLTVasCollateral,
        LTV_PRECISION
      ),
      reserveFactor: normalize(reserve.reserveFactor, LTV_PRECISION),
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
        4
      ),
      reserveLiquidationBonus: normalize(
        valueToBigNumber(reserve.reserveLiquidationBonus).minus(LTV_PRECISION),
        4
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
