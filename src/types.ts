export type ReserveRatesData = {
  id: string;
  symbol: string;
  paramsHistory: {
    variableBorrowIndex: string;
    liquidityIndex: string;
    timestamp: number;
  }[];
};

export type ReserveData = {
  id: string;
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: number;
  isActive: boolean;
  isFreezed: boolean;
  usageAsCollateralEnabled: boolean;
  borrowingEnabled: boolean;
  stableBorrowRateEnabled: boolean;
  reserveFactor: string;
  baseLTVasCollateral: string;
  optimalUtilisationRate: string;
  stableRateSlope1: string;
  stableRateSlope2: string;
  averageStableBorrowRate: string;
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
  totalBorrows: string;
  totalBorrowsStable: string;
  totalBorrowsVariable: string;
  totalLiquidity: string;
  utilizationRate: string;
  lastUpdateTimestamp: number;
  price: {
    priceInEth: string;
  };
};

export type UserReserveData = {
  principalATokenBalance: string;
  userBalanceIndex: string;
  usageAsCollateralEnabledOnUser: boolean;
  principalVariableBorrows: string;
  variableBorrowIndex: string;
  stableBorrowRate: string;
  principalStableBorrows: string;
  lastStableBorrowsUpdateTimestamp: number;
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