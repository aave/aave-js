import { ENS, tEthereumAddress, tStringDecimalUnits } from '.';

export type GovDelegate = {
  user: tEthereumAddress;
  delegatee: tEthereumAddress | ENS;
  governanceToken: tEthereumAddress;
};

export type GovDelegateByType = {
  user: tEthereumAddress;
  delegatee: tEthereumAddress | ENS;
  delegationType: tStringDecimalUnits;
  governanceToken: tEthereumAddress;
};
export type GovDelegateBySig = {
  user: tEthereumAddress;
  delegatee: tEthereumAddress | ENS;
  expiry: tStringDecimalUnits;
  signature: string;
  governanceToken: tEthereumAddress;
};
export type GovDelegateByTypeBySig = {
  user: tEthereumAddress;
  delegatee: tEthereumAddress | ENS;
  delegationType: tStringDecimalUnits;
  expiry: tStringDecimalUnits;
  signature: string;
  governanceToken: tEthereumAddress;
};
export type GovPrepareDelegateSig = {
  delegatee: tEthereumAddress | ENS;
  nonce: tStringDecimalUnits;
  expiry: tStringDecimalUnits;
  governanceTokenName: string;
  governanceToken: tEthereumAddress;
};
export type GovPrepareDelegateSigByType = {
  delegatee: tEthereumAddress | ENS;
  type: tStringDecimalUnits;
  nonce: tStringDecimalUnits;
  expiry: tStringDecimalUnits;
  governanceTokenName: string;
  governanceToken: tEthereumAddress;
};

// Data types
export type GovGetDelegateeByType = {
  delegator: tEthereumAddress;
  delegationType: tStringDecimalUnits;
  governanceToken: tEthereumAddress;
};
export type GovGetPowerCurrent = {
  user: tEthereumAddress;
  delegationType: tStringDecimalUnits;
  governanceToken: tEthereumAddress;
};
export type GovGetPowerAtBlock = {
  user: tEthereumAddress;
  blockNumber: tStringDecimalUnits;
  delegationType: tStringDecimalUnits;
  governanceToken: tEthereumAddress;
};
export type GovGetNonce = {
  user: tEthereumAddress;
  governanceToken: tEthereumAddress;
};
