import {
  tEthereumAddress,
  EthereumTransactionTypeExtended,
  tStringCurrencyUnits,
} from '../types';

export default interface LTAMigratorInterface {
  migrateLendToAave: (
    user: tEthereumAddress,
    amount: tStringCurrencyUnits
  ) => Promise<EthereumTransactionTypeExtended[]>;
}
