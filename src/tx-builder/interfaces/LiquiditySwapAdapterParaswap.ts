import { EthereumTransactionTypeExtended } from '../types';
import { SwapAndDepositMethodType } from '../types/LiquiditySwapAdapterParaswapMethodTypes';

export default interface LiquiditySwapAdapterInterface {
  swapAndDeposit: (
    args: SwapAndDepositMethodType,
    txs?: EthereumTransactionTypeExtended[]
  ) => EthereumTransactionTypeExtended;
}
