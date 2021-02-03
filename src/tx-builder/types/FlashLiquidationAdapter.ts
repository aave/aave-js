import { tEthereumAddress } from '.';

export type Liquidation = {
  user: tEthereumAddress;
  collateralAsset: tEthereumAddress;
  borrowedAsset: tEthereumAddress;
  debtTokenCover: string;
  onBehalfOf: tEthereumAddress;
  useEthPath: boolean;
};
