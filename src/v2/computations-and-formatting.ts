import BigNumber from 'bignumber.js';

import {
  BigNumberValue,
  valueToBigNumber,
  valueToZDBigNumber,
  normalize,
  pow10,
} from '../helpers/bignumber';
import {
  calculateAvailableBorrowsETH,
  calculateHealthFactorFromBalances,
  getCompoundedBalance,
  getCompoundedStableBalance,
  LTV_PRECISION,
  calculateCompoundedInterest,
  getLinearBalance,
} from '../helpers/pool-math';
import { rayMul } from '../helpers/ray-math';
import {
  ComputedUserReserve,
  ReserveData,
  UserReserveData,
  UserSummaryData,
} from './types';
import { ETH_DECIMALS, RAY_DECIMALS, USD_DECIMALS } from '../helpers/constants';

export function getEthAndUsdBalance(
  balance: BigNumberValue,
  priceInEth: BigNumberValue,
  decimals: number,
  usdPriceEth: BigNumberValue
): [string, string] {
  const balanceInEth = valueToZDBigNumber(balance)
    .multipliedBy(priceInEth)
    .dividedBy(pow10(decimals));
  const balanceInUsd = balanceInEth
    .multipliedBy(pow10(USD_DECIMALS))
    .dividedBy(usdPriceEth)
    .toFixed(0);
  return [balanceInEth.toString(), balanceInUsd];
}

/*
type ComputeUserReserveDataPoolReserve = Pick<
  ReserveData,
  | 'price'
  | 'decimals'
  | 'liquidityIndex'
  | 'liquidityRate'
  | 'lastUpdateTimestamp'
  | 'variableBorrowIndex'
  | 'variableBorrowRate'
>;

type ComputeUserReserveDataUserReserve = Pick<
  UserReserveData,
  | 'scaledATokenBalance'
  | 'scaledVariableDebt'
  | 'principalStableDebt'
  | 'stableBorrowRate'
  | 'stableBorrowLastUpdateTimestamp'
>;
*/

export function computeUserReserveData(
  poolReserve: ReserveData,
  userReserve: UserReserveData,
  usdPriceEth: BigNumberValue,
  currentTimestamp: number
): ComputedUserReserve {
  const {
    price: { priceInEth },
    decimals,
  } = poolReserve;
  const underlyingBalance = getLinearBalance(
    userReserve.scaledATokenBalance,
    poolReserve.liquidityIndex,
    poolReserve.liquidityRate,
    poolReserve.lastUpdateTimestamp,
    currentTimestamp
  ).toString();
  const [underlyingBalanceETH, underlyingBalanceUSD] = getEthAndUsdBalance(
    underlyingBalance,
    priceInEth,
    decimals,
    usdPriceEth
  );

  const variableBorrows = getCompoundedBalance(
    userReserve.scaledVariableDebt,
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
    userReserve.principalStableDebt,
    userReserve.stableBorrowRate,
    userReserve.stableBorrowLastUpdateTimestamp,
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
  poolReservesData: { [key: string]: ReserveData },
  rawUserReserves: UserReserveData[],
  userId: string,
  usdPriceEth: BigNumberValue,
  currentTimestamp: number
) {
  let totalCollateralETH = valueToZDBigNumber('0');
  let totalBorrowsETH = valueToZDBigNumber('0');
  let currentLiquidationThreshold = valueToBigNumber('0');

  const userReservesData = rawUserReserves.map((userReserve) => {
    const poolReserve = poolReservesData[userReserve.reserve.id];
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
      currentLiquidationThreshold = currentLiquidationThreshold.plus(
        valueToBigNumber(computedUserReserve.underlyingBalanceETH).multipliedBy(
          poolReserve.reserveLiquidationThreshold
        )
      );
    }
    return computedUserReserve;
  });
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

  return {
    id: userId,
    totalCollateralETH: totalCollateralETH.toString(),
    totalBorrowsETH: totalBorrowsETH.toString(),
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
              pow10(LTV_PRECISION)
            ),
            4
          ),
          liquidityRate: normalize(reserve.liquidityRate, RAY_DECIMALS),
        },
        scaledATokenBalance: normalize(
          userReserve.scaledATokenBalance,
          reserveDecimals
        ),
        stableBorrowRate: normalize(userReserve.stableBorrowRate, RAY_DECIMALS),
        variableBorrowIndex: normalize(
          userReserve.variableBorrowIndex,
          RAY_DECIMALS
        ),
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

/**
 * Calculates the formatted debt accrued to a given point in time.
 * @param reserve
 * @param currentTimestamp unix timestamp which must be higher than reserve.lastUpdateTimestamp
 */
export function calculateReserveDebt(
  reserve: {
    totalScaledVariableDebt: string;
    totalPrincipalStableDebt: string;
    averageStableRate: string;
    variableBorrowIndex: string;
    variableBorrowRate: string;
    lastUpdateTimestamp: number;
    stableDebtLastUpdateTimestamp: number;
    decimals: number;
  },
  currentTimestamp: number
) {
  const totalVariableDebt = normalize(
    rayMul(
      rayMul(reserve.totalScaledVariableDebt, reserve.variableBorrowIndex),
      calculateCompoundedInterest(
        reserve.variableBorrowRate,
        currentTimestamp,
        reserve.lastUpdateTimestamp
      )
    ),
    reserve.decimals
  );
  const totalStableDebt = normalize(
    rayMul(
      reserve.totalPrincipalStableDebt,
      calculateCompoundedInterest(
        reserve.averageStableRate,
        currentTimestamp,
        reserve.stableDebtLastUpdateTimestamp
      )
    ),
    reserve.decimals
  );
  return { totalVariableDebt, totalStableDebt };
}

export function formatReserves<
  T extends {
    availableLiquidity: string;
    averageStableRate: string;
    baseLTVasCollateral: string;
    decimals: number;
    id: string;
    lastUpdateTimestamp: number;
    liquidityIndex: string;
    liquidityRate: string;
    priceInEth: string;
    reserveFactor: string;
    reserveLiquidationBonus: string;
    reserveLiquidationThreshold: string;
    stableBorrowRate: string;
    stableDebtLastUpdateTimestamp: number;
    totalScaledVariableDebt: string;
    totalPrincipalStableDebt: string;
    variableBorrowIndex: string;
    variableBorrowRate: string;
  }
>(reserves: T[], currentTimestamp?: number) {
  return reserves.map((reserve) => {
    const availableLiquidity = normalize(
      reserve.availableLiquidity,
      reserve.decimals
    );

    const { totalVariableDebt, totalStableDebt } = calculateReserveDebt(
      reserve,
      currentTimestamp || reserve.lastUpdateTimestamp
    );

    const totalDebt = valueToBigNumber(totalStableDebt).plus(totalVariableDebt);

    const totalLiquidity = totalDebt.plus(availableLiquidity).toString();
    const utilizationRate =
      totalLiquidity !== '0'
        ? totalDebt.dividedBy(totalLiquidity).toString()
        : '0';
    return {
      ...reserve,
      totalVariableDebt,
      totalStableDebt,
      totalLiquidity,
      availableLiquidity,
      utilizationRate,
      totalDebt: totalDebt.toString(),
      priceInEth: normalize(reserve.priceInEth, ETH_DECIMALS),
      baseLTVasCollateral: normalize(
        reserve.baseLTVasCollateral,
        LTV_PRECISION
      ),
      reserveFactor: normalize(reserve.reserveFactor, LTV_PRECISION),
      variableBorrowRate: normalize(reserve.variableBorrowRate, RAY_DECIMALS),
      stableBorrowRate: normalize(reserve.stableBorrowRate, RAY_DECIMALS),
      liquidityRate: normalize(reserve.liquidityRate, RAY_DECIMALS),
      liquidityIndex: normalize(reserve.liquidityIndex, RAY_DECIMALS),
      reserveLiquidationThreshold: normalize(
        reserve.reserveLiquidationThreshold,
        4
      ),
      reserveLiquidationBonus: normalize(
        valueToBigNumber(reserve.reserveLiquidationBonus).minus(
          10 ** LTV_PRECISION
        ),
        4
      ),
      totalScaledVariableDebt: normalize(
        reserve.totalScaledVariableDebt,
        reserve.decimals
      ),
      totalPrincipalStableDebt: normalize(
        reserve.totalPrincipalStableDebt,
        reserve.decimals
      ),
      variableBorrowIndex: normalize(reserve.variableBorrowIndex, RAY_DECIMALS),
    };
  });
}
