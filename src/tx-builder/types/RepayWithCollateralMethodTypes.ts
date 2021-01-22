import { PermitSignature, tEthereumAddress } from '.';

export type RepayWithCollateralType = {
  user: tEthereumAddress;
  collateralAsset: tEthereumAddress;
  debtAsset: tEthereumAddress;
  collateralAmount: string;
  debtRepayAmount: string;
  debtRateMode: number;
  permit: PermitSignature;
  useEthPath?: boolean;
};
