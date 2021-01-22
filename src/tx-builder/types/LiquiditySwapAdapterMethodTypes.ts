import { PermitSignature, tEthereumAddress } from '.';

export type SwapAndDepositMethodType = {
  user: tEthereumAddress;
  assetToSwapFrom: tEthereumAddress;
  assetToSwapTo: tEthereumAddress;
  amountToSwap: string;
  minAmountToReceive: string;
  permitParams: PermitSignature;
  useEthPath?: boolean;
};
