export enum BorrowRateMode {
  None = 'None',
  Stable = 'Stable',
  Variable = 'Variable',
}

export type ReserveData = {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  isActive: boolean;
  usageAsCollateralEnabled: number;
  borrowingEnabled: number;
  stableBorrowRateEnabled: number;
  baseLTVasCollateral: string;
  liquidityIndex: string;
  reserveLiquidationThreshold: string;
  variableBorrowIndex: string;
  availableLiquidity: string;
  stableBorrowRate: string;
  liquidityRate: string;
  totalBorrows: string;
  totalBorrowsStable: string;
  totalBorrowsVariable: string;
  totalLiquidity: string;
  utilizationRate: string;
  variableBorrowRate: string;
  lastUpdateTimestamp: number;
  aToken: {
    id: string;
  };
  price: {
    priceInEth: string;
  };
};

export type UserReserveData = {
  principalATokenBalance: string;
  userBalanceIndex: string;
  redirectedBalance: string;
  interestRedirectionAddress: string;
  usageAsCollateralEnabledOnUser: string;
  borrowRate: string;
  borrowRateMode: BorrowRateMode;
  originationFee: string;
  principalBorrows: string;
  variableBorrowIndex: string;
  lastUpdateTimestamp: number;
  reserve: {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
    liquidityRate: string;
    lastUpdateTimestamp: number;
    aToken: {
      id: string;
    };
  };
};

export type ComputedUserReserve = UserReserveData & {
  currentUnderlyingBalance: string;
  currentUnderlyingBalanceETH: string;
  currentUnderlyingBalanceUSD: string;

  currentBorrows: string;
  currentBorrowsETH: string;
  currentBorrowsUSD: string;

  principalBorrowsETH: string;
  principalBorrowsUSD: string;

  originationFeeETH: string;
  originationFeeUSD: string;
};

export type UserSummaryData = {
  id: string;
  totalLiquidityETH: string;
  totalCollateralETH: string;
  totalBorrowsETH: string;
  totalFeesETH: string;
  totalLiquidityUSD: string;
  totalCollateralUSD: string;
  totalBorrowsUSD: string;
  availableBorrowsETH: string;
  currentLoanToValue: string;
  currentLiquidationThreshold: string;
  maxAmountToWithdrawInEth: string;
  healthFactor: string;
  reservesData: ComputedUserReserve[];
};
