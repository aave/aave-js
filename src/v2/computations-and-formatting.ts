import BigNumber from 'bignumber.js';

import {
  BigNumberValue,
  valueToBigNumber,
  valueToZDBigNumber,
  normalize,
  pow10,
  normalizeBN,
} from '../helpers/bignumber';
import {
  calculateAvailableBorrowsETH,
  calculateHealthFactorFromBalances,
  getCompoundedBalance,
  getCompoundedStableBalance,
  calculateAverageRate,
  LTV_PRECISION,
  calculateCompoundedInterest,
  getLinearBalance,
} from '../helpers/pool-math';
import { RAY, rayDiv, rayMul, rayPow } from '../helpers/ray-math';
import {
  ComputedUserReserve,
  ReserveData,
  UserReserveData,
  UserSummaryData,
  ReserveRatesData,
  ComputedReserveData,
  Supplies,
  ReserveSupplyData,
  RewardsInformation,
} from './types';
import {
  ETH_DECIMALS,
  RAY_DECIMALS,
  SECONDS_PER_YEAR,
  USD_DECIMALS,
} from '../helpers/constants';

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
  currentTimestamp: number,
  rewardsInfo: RewardsInformation
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
    poolReserve.stableBorrowRate,
    userReserve.stableBorrowLastUpdateTimestamp,
    currentTimestamp
  ).toString();

  const [stableBorrowsETH, stableBorrowsUSD] = getEthAndUsdBalance(
    stableBorrows,
    priceInEth,
    decimals,
    usdPriceEth
  );
  const {
    totalLiquidity,
    totalStableDebt,
    totalVariableDebt,
  } = calculateSupplies(
    {
      totalScaledVariableDebt: poolReserve.totalScaledVariableDebt,
      variableBorrowIndex: poolReserve.variableBorrowIndex,
      variableBorrowRate: poolReserve.variableBorrowRate,
      totalPrincipalStableDebt: poolReserve.totalPrincipalStableDebt,
      averageStableRate: poolReserve.averageStableRate,
      availableLiquidity: poolReserve.availableLiquidity,
      stableDebtLastUpdateTimestamp: poolReserve.stableDebtLastUpdateTimestamp,
      lastUpdateTimestamp: poolReserve.lastUpdateTimestamp,
    },
    currentTimestamp
  );

  const aTokenRewards = totalLiquidity.gt(0)
    ? calculateRewards(
        userReserve.scaledATokenBalance,
        poolReserve.aTokenIncentivesIndex,
        userReserve.aTokenincentivesUserIndex,
        rewardsInfo.incentivePrecision,
        rewardsInfo.rewardTokenDecimals,
        poolReserve.aIncentivesLastUpdateTimestamp,
        poolReserve.aEmissionPerSecond,
        rayDiv(totalLiquidity, poolReserve.liquidityIndex),
        currentTimestamp,
        rewardsInfo.emissionEndTimestamp
      )
    : '0';

  const [aTokenRewardsETH, aTokenRewardsUSD] = getEthAndUsdBalance(
    aTokenRewards,
    rewardsInfo.rewardTokenPriceEth,
    rewardsInfo.rewardTokenDecimals,
    usdPriceEth
  );

  const vTokenRewards = totalVariableDebt.gt(0)
    ? calculateRewards(
        userReserve.scaledVariableDebt,
        poolReserve.vTokenIncentivesIndex,
        userReserve.vTokenincentivesUserIndex,
        rewardsInfo.incentivePrecision,
        rewardsInfo.rewardTokenDecimals,
        poolReserve.vIncentivesLastUpdateTimestamp,
        poolReserve.vEmissionPerSecond,
        new BigNumber(poolReserve.totalScaledVariableDebt),
        currentTimestamp,
        rewardsInfo.emissionEndTimestamp
      )
    : '0';

  const [vTokenRewardsETH, vTokenRewardsUSD] = getEthAndUsdBalance(
    vTokenRewards,
    rewardsInfo.rewardTokenPriceEth,
    rewardsInfo.rewardTokenDecimals,
    usdPriceEth
  );
  const sTokenRewards = totalStableDebt.gt(0)
    ? calculateRewards(
        userReserve.principalStableDebt,
        poolReserve.sTokenIncentivesIndex,
        userReserve.sTokenincentivesUserIndex,
        rewardsInfo.incentivePrecision,
        rewardsInfo.rewardTokenDecimals,
        poolReserve.sIncentivesLastUpdateTimestamp,
        poolReserve.sEmissionPerSecond,
        new BigNumber(poolReserve.totalPrincipalStableDebt),
        currentTimestamp,
        rewardsInfo.emissionEndTimestamp
      )
    : '0';

  const [sTokenRewardsETH, sTokenRewardsUSD] = getEthAndUsdBalance(
    sTokenRewards,
    rewardsInfo.rewardTokenPriceEth,
    rewardsInfo.rewardTokenDecimals,
    usdPriceEth
  );

  const exactStableBorrowRate = rayPow(
    valueToZDBigNumber(userReserve.stableBorrowRate)
      .dividedBy(SECONDS_PER_YEAR)
      .plus(RAY),
    SECONDS_PER_YEAR
  ).minus(RAY);

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
    aTokenRewards,
    aTokenRewardsETH,
    aTokenRewardsUSD,
    vTokenRewards,
    vTokenRewardsETH,
    vTokenRewardsUSD,
    sTokenRewards,
    sTokenRewardsETH,
    sTokenRewardsUSD,
    totalRewards: valueToZDBigNumber(aTokenRewards)
      .plus(vTokenRewards)
      .plus(sTokenRewards)
      .toString(),
    totalRewardsETH: valueToZDBigNumber(aTokenRewardsETH)
      .plus(vTokenRewardsETH)
      .plus(sTokenRewardsETH)
      .toString(),
    totalRewardsUSD: valueToZDBigNumber(aTokenRewardsUSD)
      .plus(vTokenRewardsUSD)
      .plus(sTokenRewardsUSD)
      .toString(),
    stableBorrowAPR: normalize(userReserve.stableBorrowRate, RAY_DECIMALS),
    stableBorrowAPY: normalize(exactStableBorrowRate, RAY_DECIMALS),
  };
}

export function computeRawUserSummaryData(
  poolReservesData: ReserveData[],
  rawUserReserves: UserReserveData[],
  userId: string,
  usdPriceEth: BigNumberValue,
  currentTimestamp: number,
  rewardsInfo: RewardsInformation
): UserSummaryData {
  let totalLiquidityETH = valueToZDBigNumber('0');
  let totalCollateralETH = valueToZDBigNumber('0');
  let totalBorrowsETH = valueToZDBigNumber('0');
  let currentLtv = valueToBigNumber('0');
  let currentLiquidationThreshold = valueToBigNumber('0');

  let totalRewards = valueToBigNumber('0');
  let totalRewardsETH = valueToBigNumber('0');
  let totalRewardsUSD = valueToBigNumber('0');

  const userReservesData = rawUserReserves
    .map((userReserve) => {
      const poolReserve = poolReservesData.find(
        (reserve) => reserve.id === userReserve.reserve.id
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
        currentTimestamp,
        rewardsInfo
      );

      totalRewards = totalRewards.plus(computedUserReserve.totalRewards);
      totalRewardsETH = totalRewardsETH.plus(
        computedUserReserve.totalRewardsETH
      );
      totalRewardsUSD = totalRewardsUSD.plus(
        computedUserReserve.totalRewardsUSD
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
    .multipliedBy(pow10(USD_DECIMALS))
    .dividedBy(usdPriceEth)
    .toString();

  const totalLiquidityUSD = totalLiquidityETH
    .multipliedBy(pow10(USD_DECIMALS))
    .dividedBy(usdPriceEth)
    .toString();

  const totalBorrowsUSD = totalBorrowsETH
    .multipliedBy(pow10(USD_DECIMALS))
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
    totalRewards: totalRewards.toString(),
    totalRewardsETH: totalRewardsETH.toString(),
    totalRewardsUSD: totalRewardsUSD.toString(),
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
  currentTimestamp: number,
  rewardsInfo: RewardsInformation
): UserSummaryData {
  const userData = computeRawUserSummaryData(
    poolReservesData,
    rawUserReserves,
    userId,
    usdPriceEth,
    currentTimestamp,
    rewardsInfo
  );
  const userReservesData = userData.reservesData.map(
    ({ reserve, ...userReserve }): ComputedUserReserve => {
      const reserveDecimals = reserve.decimals;

      const exactStableBorrowRate = rayPow(
        valueToZDBigNumber(userReserve.stableBorrowRate)
          .dividedBy(SECONDS_PER_YEAR)
          .plus(RAY),
        SECONDS_PER_YEAR
      ).minus(RAY);

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
        },
        scaledATokenBalance: normalize(
          userReserve.scaledATokenBalance,
          reserveDecimals
        ),
        stableBorrowAPR: normalize(userReserve.stableBorrowRate, RAY_DECIMALS),
        stableBorrowAPY: normalize(exactStableBorrowRate, RAY_DECIMALS),
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
    totalRewards: userData.totalRewards,
    totalRewardsETH: userData.totalRewardsETH,
    totalRewardsUSD: userData.totalRewardsUSD,
  };
}

/**
 * Calculates the formatted debt accrued to a given point in time.
 * @param reserve
 * @param currentTimestamp unix timestamp which must be higher than reserve.lastUpdateTimestamp
 */
export function calculateReserveDebt(
  reserve: ReserveData,
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

export function formatReserves(
  reserves: ReserveData[],
  currentTimestamp?: number,
  reserveIndexes30DaysAgo?: ReserveRatesData[],
  rewardTokenPriceEth = '0',
  emissionEndTimestamp?: number
): ComputedReserveData[] {
  return reserves.map((reserve) => {
    const reserve30DaysAgo = reserveIndexes30DaysAgo?.find(
      (res) => res.id === reserve.id
    )?.paramsHistory?.[0];

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

    const hasEmission =
      emissionEndTimestamp &&
      emissionEndTimestamp >
        (currentTimestamp || Math.floor(Date.now() / 1000));

    const aIncentivesAPY =
      hasEmission && totalLiquidity !== '0'
        ? calculateIncentivesAPY(
            reserve.aEmissionPerSecond,
            rewardTokenPriceEth,
            totalLiquidity,
            reserve.price.priceInEth
          )
        : '0';

    const vIncentivesAPY =
      hasEmission && totalVariableDebt !== '0'
        ? calculateIncentivesAPY(
            reserve.vEmissionPerSecond,
            rewardTokenPriceEth,
            totalVariableDebt,
            reserve.price.priceInEth
          )
        : '0';

    const sIncentivesAPY =
      hasEmission && totalStableDebt !== '0'
        ? calculateIncentivesAPY(
            reserve.sEmissionPerSecond,
            rewardTokenPriceEth,
            totalStableDebt,
            reserve.price.priceInEth
          )
        : '0';

    const supplyAPY = rayPow(
      valueToZDBigNumber(reserve.liquidityRate)
        .dividedBy(SECONDS_PER_YEAR)
        .plus(RAY),
      SECONDS_PER_YEAR
    ).minus(RAY);

    const variableBorrowAPY = rayPow(
      valueToZDBigNumber(reserve.variableBorrowRate)
        .dividedBy(SECONDS_PER_YEAR)
        .plus(RAY),
      SECONDS_PER_YEAR
    ).minus(RAY);

    const stableBorrowAPY = rayPow(
      valueToZDBigNumber(reserve.stableBorrowRate)
        .dividedBy(SECONDS_PER_YEAR)
        .plus(RAY),
      SECONDS_PER_YEAR
    ).minus(RAY);

    return {
      ...reserve,
      totalVariableDebt,
      totalStableDebt,
      totalLiquidity,
      availableLiquidity,
      utilizationRate,
      aIncentivesAPY,
      vIncentivesAPY,
      sIncentivesAPY,
      totalDebt: totalDebt.toString(),
      price: {
        ...reserve.price,
        priceInEth: normalize(reserve.price.priceInEth, ETH_DECIMALS),
      },
      baseLTVasCollateral: normalize(
        reserve.baseLTVasCollateral,
        LTV_PRECISION
      ),
      reserveFactor: normalize(reserve.reserveFactor, LTV_PRECISION),
      variableBorrowAPR: normalize(reserve.variableBorrowRate, RAY_DECIMALS),
      variableBorrowAPY: normalize(variableBorrowAPY, RAY_DECIMALS),
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

      stableBorrowAPR: normalize(reserve.stableBorrowRate, RAY_DECIMALS),
      stableBorrowAPY: normalize(stableBorrowAPY, RAY_DECIMALS),
      supplyAPR: normalize(reserve.liquidityRate, RAY_DECIMALS),
      supplyAPY: normalize(supplyAPY, RAY_DECIMALS),
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

/**
 * Calculates the debt accrued to a given point in time.
 * @param reserve
 * @param currentTimestamp unix timestamp which must be higher than reserve.lastUpdateTimestamp
 */
export function calculateReserveDebtSuppliesRaw(
  reserve: ReserveSupplyData,
  currentTimestamp: number
) {
  const totalVariableDebt = rayMul(
    rayMul(reserve.totalScaledVariableDebt, reserve.variableBorrowIndex),
    calculateCompoundedInterest(
      reserve.variableBorrowRate,
      currentTimestamp,
      reserve.lastUpdateTimestamp
    )
  );
  const totalStableDebt = rayMul(
    reserve.totalPrincipalStableDebt,
    calculateCompoundedInterest(
      reserve.averageStableRate,
      currentTimestamp,
      reserve.stableDebtLastUpdateTimestamp
    )
  );
  return { totalVariableDebt, totalStableDebt };
}

export function calculateSupplies(
  reserve: ReserveSupplyData,
  currentTimestamp: number
): Supplies {
  const {
    totalVariableDebt,
    totalStableDebt,
  } = calculateReserveDebtSuppliesRaw(reserve, currentTimestamp);

  const totalDebt = totalVariableDebt.plus(totalStableDebt);

  const totalLiquidity = totalDebt.plus(reserve.availableLiquidity);
  return {
    totalVariableDebt,
    totalStableDebt,
    totalLiquidity,
  };
}

export function calculateIncentivesAPY(
  emissionPerSecond: string,
  rewardTokenPriceInEth: string,
  tokenTotalSupplyNormalized: string,
  tokenPriceInEth: string
): string {
  const emissionPerSecondNormalized = normalizeBN(
    emissionPerSecond,
    ETH_DECIMALS
  ).multipliedBy(rewardTokenPriceInEth);
  const emissionPerYear = emissionPerSecondNormalized.multipliedBy(
    SECONDS_PER_YEAR
  );

  const totalSupplyNormalized = valueToBigNumber(
    tokenTotalSupplyNormalized
  ).multipliedBy(tokenPriceInEth);

  return emissionPerYear.dividedBy(totalSupplyNormalized).toString(10);
}

export function calculateRewards(
  principalUserBalance: string,
  reserveIndex: string,
  userIndex: string,
  precision: number,
  rewardTokenDecimals: number,
  reserveIndexTimestamp: number,
  emissionPerSecond: string,
  totalSupply: BigNumber,
  currentTimestamp: number,
  emissionEndTimestamp: number
): string {
  const actualCurrentTimestamp =
    currentTimestamp > emissionEndTimestamp
      ? emissionEndTimestamp
      : currentTimestamp;

  const timeDelta = actualCurrentTimestamp - reserveIndexTimestamp;

  let currentReserveIndex;
  if (
    reserveIndexTimestamp == +currentTimestamp ||
    reserveIndexTimestamp >= emissionEndTimestamp
  ) {
    currentReserveIndex = valueToZDBigNumber(reserveIndex);
  } else {
    currentReserveIndex = valueToZDBigNumber(emissionPerSecond)
      .multipliedBy(timeDelta)
      .multipliedBy(pow10(precision))
      .dividedBy(totalSupply)
      .plus(reserveIndex);
  }

  const reward = valueToZDBigNumber(principalUserBalance)
    .multipliedBy(currentReserveIndex.minus(userIndex))
    .dividedBy(pow10(precision));

  return normalize(reward, rewardTokenDecimals);
}
