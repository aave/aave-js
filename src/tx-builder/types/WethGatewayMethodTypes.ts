import { InterestRate, tEthereumAddress, tStringCurrencyUnits } from '.';

export type WETHDepositParamsType = {
  lendingPool: tEthereumAddress;
  user: tEthereumAddress;
  amount: tStringCurrencyUnits;
  onBehalfOf?: tEthereumAddress;
  referralCode?: string;
};

export type WETHWithdrawParamsType = {
  lendingPool: tEthereumAddress;
  user: tEthereumAddress;
  amount: tStringCurrencyUnits;
  aTokenAddress: tEthereumAddress;
  onBehalfOf?: tEthereumAddress;
};

export type WETHRepayParamsType = {
  lendingPool: tEthereumAddress;
  user: tEthereumAddress;
  amount: tStringCurrencyUnits;
  interestRateMode: InterestRate;
  onBehalfOf?: tEthereumAddress;
};

export type WETHBorrowParamsType = {
  lendingPool: tEthereumAddress;
  user: tEthereumAddress;
  amount: tStringCurrencyUnits;
  debtTokenAddress: tEthereumAddress;
  interestRateMode: InterestRate;
  referralCode?: string;
};
