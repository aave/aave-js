import { InterestRate, tEthereumAddress, tStringCurrencyUnits } from '.';

export type WETHDepositParamsType = {
  user: tEthereumAddress;
  amount: tStringCurrencyUnits;
  onBehalfOf?: tEthereumAddress;
  referralCode?: string;
};

export type WETHWithdrawParamsType = {
  user: tEthereumAddress;
  amount: tStringCurrencyUnits;
  aTokenAddress: tEthereumAddress;
  onBehalfOf?: tEthereumAddress;
};

export type WETHRepayParamsType = {
  user: tEthereumAddress;
  amount: tStringCurrencyUnits;
  interestRateMode: InterestRate;
  onBehalfOf?: tEthereumAddress;
};

export type WETHBorrowParamsType = {
  user: tEthereumAddress;
  amount: tStringCurrencyUnits;
  debtTokenAddress: tEthereumAddress;
  interestRateMode: InterestRate;
  referralCode?: string;
};
