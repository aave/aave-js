import { tEthereumAddress } from '.';

export type Liquidation = {
  user: tEthereumAddress;
  collateralAsset: tEthereumAddress;
  borrowedAsset: tEthereumAddress;
  debtTokenCover: number;
  flashBorrowedAmount: number;
  onBehalfOf: tEthereumAddress;
  useEthPath: boolean;
};
