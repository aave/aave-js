import { EthereumTransactionTypeExtended } from '../types';
import { FaucetParamsType } from '../types/FaucetMethodTypes';

export default interface FaucetInterface {
  mint: (args: FaucetParamsType) => Promise<EthereumTransactionTypeExtended[]>;
}
