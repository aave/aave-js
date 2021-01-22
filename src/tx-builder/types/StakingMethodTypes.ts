import { tEthereumAddress, tStringCurrencyUnits } from '.';

export type signStakingParamsType = {
  user: tEthereumAddress;
  amount: tStringCurrencyUnits;
  nonce: string;
};

export type stakeWithPermitParamsType = {
  user: tEthereumAddress;
  amount: tStringCurrencyUnits;
  signature: string;
};

export type stakeParamsType = {
  user: tEthereumAddress;
  amount: tStringCurrencyUnits;
  onBehalfOf?: tEthereumAddress;
};

export type redeemParamsType = {
  user: tEthereumAddress;
  amount: tStringCurrencyUnits;
};

export type cooldownParamsType = {
  user: tEthereumAddress;
};

export type claimRewardsParamsType = {
  user: tEthereumAddress;
  amount: tStringCurrencyUnits;
};
