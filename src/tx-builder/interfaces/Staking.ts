import {
  EthereumTransactionTypeExtended,
  tEthereumAddress,
  tStringCurrencyUnits,
} from '../types';

export default interface StakingInterface {
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
  claimRewardsAndStake: (
    user: tEthereumAddress,
    amount: tStringCurrencyUnits
  ) => Promise<EthereumTransactionTypeExtended[]>;
  claimRewardsAndRedeem: (
    user: tEthereumAddress,
    claimAmount: tStringCurrencyUnits,
    redeemAmount: tStringCurrencyUnits
  ) => Promise<EthereumTransactionTypeExtended[]>;
  claimAllRewards: (
    user: tEthereumAddress
  ) => Promise<EthereumTransactionTypeExtended[]>;
  claimAllRewardsAndStake: (
    user: tEthereumAddress
  ) => Promise<EthereumTransactionTypeExtended[]>;
}
