import BigNumber from 'bignumber.js';

export type ReserveRatesData = {
  id: string;
  symbol: string;
  paramsHistory: {
    variableBorrowIndex: string;
    liquidityIndex: string;
    timestamp: number;
  }[];
};

export type ReserveSupplyData = {
  totalScaledVariableDebt: string;
  variableBorrowIndex: string;
  variableBorrowRate: string;
  totalPrincipalStableDebt: string;
  averageStableRate: string;
  availableLiquidity: string;
  stableDebtLastUpdateTimestamp: number;
  lastUpdateTimestamp: number;
};

export type RewardsInformation = {
  rewardTokenAddress: string;
  rewardTokenDecimals: number;
  incentivePrecision: number;
  rewardTokenPriceEth: string;
  emissionEndTimestamp: number;
};

export type ReserveData = {
  id: string;
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: number;
  isActive: boolean;
  isFrozen: boolean;
  usageAsCollateralEnabled: boolean;
  aTokenAddress: string;
  stableDebtTokenAddress: string;
  variableDebtTokenAddress: string;
  borrowingEnabled: boolean;
  stableBorrowRateEnabled: boolean;
  reserveFactor: string;
  baseLTVasCollateral: string;
  optimalUtilisationRate: string;
  stableRateSlope1: string;
  stableRateSlope2: string;
  averageStableRate: string;
  stableDebtLastUpdateTimestamp: number;
  baseVariableBorrowRate: string;
  variableRateSlope1: string;
  variableRateSlope2: string;
  liquidityIndex: string;
  reserveLiquidationThreshold: string;
  reserveLiquidationBonus: string;
  variableBorrowIndex: string;
  variableBorrowRate: string;
  avg30DaysVariableBorrowRate?: string;
  availableLiquidity: string;
  stableBorrowRate: string;
  liquidityRate: string;
  avg30DaysLiquidityRate?: string;
  totalPrincipalStableDebt: string;
  totalScaledVariableDebt: string;
  lastUpdateTimestamp: number;
  price: {
    priceInEth: string;
  };
};

export type IncentivizedReserve = {
  id: string;
  aEmissionPerSecond: string;
  vEmissionPerSecond: string;
  sEmissionPerSecond: string;
  totalLiquidity: string;
  totalVariableDebt: string;
  totalStableDebt: string;
  price: {
    priceInEth: string;
  };
};

export type ReserveIncentivesAPY = {
  id: string;
  aIncentivesAPY: string;
  vIncentivesAPY: string;
  sIncentivesAPY: string;
};

export type IncentivizedUserReserve = {
  aTokenincentivesUserIndex: string;
  vTokenincentivesUserIndex: string;
  sTokenincentivesUserIndex: string;
  reserve: {
    id: string;
  };
};

export type IncentivizedUserReserveData = {
  id: string;
  averageStableRate: string;
  stableDebtLastUpdateTimestamp: number;
  variableBorrowIndex: string;
  variableBorrowRate: string;
  avg30DaysVariableBorrowRate?: string;
  availableLiquidity: string;
  totalPrincipalStableDebt: string;
  totalScaledVariableDebt: string;
  lastUpdateTimestamp: number;
  aEmissionPerSecond: string;
  vEmissionPerSecond: string;
  sEmissionPerSecond: string;
  aIncentivesLastUpdateTimestamp: number;
  vIncentivesLastUpdateTimestamp: number;
  sIncentivesLastUpdateTimestamp: number;
  aTokenIncentivesIndex: string;
  vTokenIncentivesIndex: string;
  sTokenIncentivesIndex: string;

  underlyingBalance: string;
  variableBorrows: string;
  stableBorrows: string;
};

export type ComputedReserveData = {
  utilizationRate: string;
  totalStableDebt: string;
  totalVariableDebt: string;
  totalDebt: string;
  totalLiquidity: string;
} & ReserveData;

export type Supplies = {
  totalVariableDebt: BigNumber;
  totalStableDebt: BigNumber;
  totalLiquidity: BigNumber;
};

export type UserReserveData = {
  scaledATokenBalance: string;
  usageAsCollateralEnabledOnUser: boolean;
  scaledVariableDebt: string;
  variableBorrowIndex: string;
  stableBorrowRate: string;
  principalStableDebt: string;
  stableBorrowLastUpdateTimestamp: number;
  reserve: {
    id: string;
    underlyingAsset: string;
    name: string;
    symbol: string;
    decimals: number;
    liquidityRate: string;
    reserveLiquidationBonus: string;
    lastUpdateTimestamp: number;
  };
};

export type ComputedUserReserve = UserReserveData & {
  underlyingBalance: string;
  underlyingBalanceETH: string;
  underlyingBalanceUSD: string;

  variableBorrows: string;
  variableBorrowsETH: string;
  variableBorrowsUSD: string;

  stableBorrows: string;
  stableBorrowsETH: string;
  stableBorrowsUSD: string;

  totalBorrows: string;
  totalBorrowsETH: string;
  totalBorrowsUSD: string;
};

export type ComputedUserRewards = {
  reservesData: ReserveRewards[];
  totalRewards: string;
  totalRewardsETH: string;
  totalRewardsUSD: string;
};

export type ReserveRewards = {
  id: string;
  aTokenRewards: string;
  aTokenRewardsETH: string;
  aTokenRewardsUSD: string;
  vTokenRewards: string;
  vTokenRewardsETH: string;
  vTokenRewardsUSD: string;
  sTokenRewards: string;
  sTokenRewardsETH: string;
  sTokenRewardsUSD: string;
  totalRewards: string;
  totalRewardsETH: string;
  totalRewardsUSD: string;
};

export type UserSummaryData = {
  id: string;
  totalLiquidityETH: string;
  totalLiquidityUSD: string;
  totalCollateralETH: string;
  totalCollateralUSD: string;
  totalBorrowsETH: string;
  totalBorrowsUSD: string;
  availableBorrowsETH: string;
  currentLoanToValue: string;
  currentLiquidationThreshold: string;
  healthFactor: string;
  reservesData: ComputedUserReserve[];
};
