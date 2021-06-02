import {
  EthereumTransactionTypeExtended,
  tEthereumAddress,
  tStringCurrencyUnits,
} from '../types';

export default interface StakingInterface {
  stakingContractAddress: tEthereumAddress;
  stakingRewardTokenContractAddress: tEthereumAddress;

  stake: (
    user: tEthereumAddress,
    amount: tStringCurrencyUnits,
    onBehalfOf?: tEthereumAddress
  ) => Promise<EthereumTransactionTypeExtended[]>;
  redeem: (
    user: tEthereumAddress,
    amount: tStringCurrencyUnits
  ) => Promise<EthereumTransactionTypeExtended[]>;
  cooldown: (
    user: tEthereumAddress
  ) => Promise<EthereumTransactionTypeExtended[]>;
  claimRewards: (
    user: tEthereumAddress,
    amount: tStringCurrencyUnits
  ) => Promise<EthereumTransactionTypeExtended[]>;
  signStaking: (
    user: tEthereumAddress,
    amount: tStringCurrencyUnits,
    nonce: string
  ) => Promise<string>;
  stakeWithPermit: (
    user: tEthereumAddress,
    amount: tStringCurrencyUnits,
    signature: string
  ) => Promise<EthereumTransactionTypeExtended[]>;
}
