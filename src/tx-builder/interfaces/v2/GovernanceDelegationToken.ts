import {
  EthereumTransactionTypeExtended,
  tEthereumAddress,
  tStringCurrencyUnits,
  tStringDecimalUnits,
} from '../../types';
import {
  GovDelegate,
  GovDelegateBySig,
  GovDelegateByType,
  GovDelegateByTypeBySig,
  GovGetDelegateeByType,
  GovGetNonce,
  GovGetPowerAtBlock,
  GovGetPowerCurrent,
  GovPrepareDelegateSig,
  GovPrepareDelegateSigByType,
} from '../../types/GovDelegationMethodTypes';

export default interface GovernanceDelegationToken {
  delegate: (args: GovDelegate) => Promise<EthereumTransactionTypeExtended[]>;
  delegateByType: (
    args: GovDelegateByType
  ) => Promise<EthereumTransactionTypeExtended[]>;
  delegateBySig: (
    args: GovDelegateBySig
  ) => Promise<EthereumTransactionTypeExtended[]>;
  delegateByTypeBySig: (
    args: GovDelegateByTypeBySig
  ) => Promise<EthereumTransactionTypeExtended[]>;
  prepareDelegateSignature: (args: GovPrepareDelegateSig) => Promise<string>;
  prepareDelegateByTypeSignature: (
    args: GovPrepareDelegateSigByType
  ) => Promise<string>;
  getDelegateeByType: (
    args: GovGetDelegateeByType
  ) => Promise<tEthereumAddress>;
  getPowerCurrent: (args: GovGetPowerCurrent) => Promise<tStringCurrencyUnits>;
  getPowerAtBlock: (args: GovGetPowerAtBlock) => Promise<tStringCurrencyUnits>;
  getNonce: (args: GovGetNonce) => Promise<tStringDecimalUnits>;
}
