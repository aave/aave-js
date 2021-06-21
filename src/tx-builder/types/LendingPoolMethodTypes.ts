import { BytesLike } from 'ethers';
import {
  tEthereumAddress,
  tStringCurrencyUnits,
  InterestRate,
  PermitSignature,
} from '.';

export type LPDepositParamsType = {
  user: tEthereumAddress;
  reserve: tEthereumAddress;
  amount: tStringCurrencyUnits;
  onBehalfOf?: tEthereumAddress;
  referralCode?: string;
};

export type LPWithdrawParamsType = {
  user: tEthereumAddress;
  reserve: tEthereumAddress;
  amount: tStringCurrencyUnits;
  onBehalfOf?: tEthereumAddress;
  aTokenAddress?: tEthereumAddress;
};
export type LPBorrowParamsType = {
  user: tEthereumAddress;
  reserve: tEthereumAddress;
  amount: tStringCurrencyUnits;
  interestRateMode: InterestRate;
  debtTokenAddress?: tEthereumAddress;
  onBehalfOf?: tEthereumAddress;
  referralCode?: string;
};
export type LPRepayParamsType = {
  user: tEthereumAddress;
  reserve: tEthereumAddress;
  amount: tStringCurrencyUnits;
  interestRateMode: InterestRate;
  onBehalfOf?: tEthereumAddress;
};
export type LPSwapBorrowRateMode = {
  user: tEthereumAddress;
  reserve: tEthereumAddress;
  interestRateMode: InterestRate;
};
export type LPSetUsageAsCollateral = {
  user: tEthereumAddress;
  reserve: tEthereumAddress;
  usageAsCollateral: boolean;
};
export type LPLiquidationCall = {
  liquidator: tEthereumAddress;
  liquidatedUser: tEthereumAddress;
  debtReserve: tEthereumAddress;
  collateralReserve: tEthereumAddress;
  purchaseAmount: tStringCurrencyUnits;
  getAToken?: boolean;
  liquidateAll?: boolean;
};

export type LPSwapCollateral = {
  user: tEthereumAddress;
  flash?: boolean;
  fromAsset: tEthereumAddress; // List of addresses of the underlying asset to be swap from
  fromAToken: tEthereumAddress;
  toAsset: tEthereumAddress; // List of the addresses of the reserve to be swapped to and deposited
  fromAmount: tStringCurrencyUnits; // List of amounts to be swapped. If the amount exceeds the balance, the total balance is used for the swap
  minToAmount: tStringCurrencyUnits;
  permitSignature?: PermitSignature;
  swapAll: boolean;
  onBehalfOf?: tEthereumAddress;
  referralCode?: string;
  augustus: tEthereumAddress;
  swapCallData: BytesLike;
};

export type LPRepayWithCollateral = {
  user: tEthereumAddress;
  fromAsset: tEthereumAddress;
  fromAToken: tEthereumAddress;
  assetToRepay: tEthereumAddress; // List of addresses of the underlying asset to be swap from
  repayWithAmount: tStringCurrencyUnits;
  repayAmount: tStringCurrencyUnits; // List of amounts to be swapped. If the amount exceeds the balance, the total balance is used for the swap
  permitSignature?: PermitSignature;
  repayAllDebt?: boolean;
  rateMode: InterestRate;
  onBehalfOf?: tEthereumAddress;
  referralCode?: string;
  flash?: boolean;
  useEthPath?: boolean;
};

export type LPFlashLoan = {
  user: tEthereumAddress;
  receiver: tEthereumAddress;
  assets: tEthereumAddress[];
  amounts: tStringCurrencyUnits[];
  modes: InterestRate[];
  onBehalfOf?: tEthereumAddress;
  referralCode?: string;
};

export type LPFlashLiquidation = {
  user: tEthereumAddress;
  collateralAsset: tEthereumAddress;
  borrowedAsset: tEthereumAddress;
  debtTokenCover: string;
  liquidateAll: boolean;
  initiator: tEthereumAddress;
  useEthPath: boolean;
};
