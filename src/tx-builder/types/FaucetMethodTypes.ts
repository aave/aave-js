import { tEthereumAddress } from '.';

export type FaucetParamsType = {
  userAddress: tEthereumAddress;
  reserve: tEthereumAddress;
  tokenSymbol: string;
};
