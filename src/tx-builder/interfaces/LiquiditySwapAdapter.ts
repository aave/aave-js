import { EthereumTransactionTypeExtended } from '../types';
import { SwapAndDepositMethodType } from '../types/LiquiditySwapAdapterMethodTypes';

export default interface LiquiditySwapAdapterInterface {
  swapAndDeposit: (
    args: SwapAndDepositMethodType
  ) => EthereumTransactionTypeExtended;
}
