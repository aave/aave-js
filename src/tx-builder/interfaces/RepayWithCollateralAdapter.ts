import { EthereumTransactionTypeExtended } from '../types';
import { RepayWithCollateralType } from '../types/RepayWithCollateralMethodTypes';

export default interface RepayWithCollateralAdapterInterface {
  swapAndRepay: (
    args: RepayWithCollateralType,
    txs: EthereumTransactionTypeExtended[]
  ) => EthereumTransactionTypeExtended;
}
