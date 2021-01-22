import {
  EthereumTransactionTypeExtended,
  tEthereumAddress,
  tStringCurrencyUnits,
  tStringDecimalUnits,
} from '../types';

export default interface BaseDebtTokenInterface {
  approveDelegation: (
    user: tEthereumAddress,
    delegatee: tEthereumAddress,
    debtTokenAddress: tEthereumAddress,
    amount: tStringDecimalUnits
  ) => EthereumTransactionTypeExtended;
  isDelegationApproved: (
    debtTokenAddress: tEthereumAddress,
    allowanceGiver: tEthereumAddress,
    spender: tEthereumAddress,
    amount: tStringCurrencyUnits
  ) => Promise<boolean>;
}
