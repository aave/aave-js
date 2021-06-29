import { commonContractAddressBetweenMarketsV2 } from '../config';
import { IClaimStakingRewardsHelper__factory } from '../contract-types/factories/IClaimStakingRewardsHelper__factory';
import { IClaimStakingRewardsHelper } from '../contract-types/IClaimStakingRewardsHelper';
import {
  Configuration,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  tEthereumAddress,
  transactionType,
} from '../types';
import { ClaimHelperValidator } from '../validators/methodValidators';
import { IsEthAddress } from '../validators/paramValidators';
import BaseService from './BaseService';

export interface ClaimStakingRewardsHelperInterface {
  claimAllRewards: (user: tEthereumAddress) => EthereumTransactionTypeExtended;
  claimAllRewardsAndStake: (
    user: tEthereumAddress
  ) => EthereumTransactionTypeExtended;

  claimAndStake: (
    user: tEthereumAddress,
    stakeToken: tEthereumAddress
  ) => EthereumTransactionTypeExtended;
}

export default class ClaimStakingRewardsHelperService
  extends BaseService<IClaimStakingRewardsHelper>
  implements ClaimStakingRewardsHelperInterface {
  readonly claimHelperAddress: string;

  constructor(config: Configuration) {
    super(config, IClaimStakingRewardsHelper__factory);

    const { network } = this.config;

    this.claimHelperAddress =
      commonContractAddressBetweenMarketsV2[network].CLAIM_HELPER_ADDRESS;
  }

  // We don't accept amount, to claim all rewards / -1
  @ClaimHelperValidator
  public claimAllRewards(
    @IsEthAddress() user: tEthereumAddress
  ): EthereumTransactionTypeExtended {
    const claimHelperContract: IClaimStakingRewardsHelper = this.getContractInstance(
      this.claimHelperAddress
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        claimHelperContract.populateTransaction.claimAllRewards(user),
      from: user,
    });

    return {
      tx: txCallback,
      txType: eEthereumTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation([], txCallback),
    };
  }

  @ClaimHelperValidator
  public claimAllRewardsAndStake(
    @IsEthAddress() user: tEthereumAddress
  ): EthereumTransactionTypeExtended {
    const claimHelperContract: IClaimStakingRewardsHelper = this.getContractInstance(
      this.claimHelperAddress
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        claimHelperContract.populateTransaction.claimAllRewardsAndStake(user),
      from: user,
    });

    return {
      tx: txCallback,
      txType: eEthereumTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation([], txCallback),
    };
  }

  @ClaimHelperValidator
  public claimAndStake(
    @IsEthAddress() user: tEthereumAddress,
    @IsEthAddress() stakeToken: tEthereumAddress
  ): EthereumTransactionTypeExtended {
    const claimHelperContract: IClaimStakingRewardsHelper = this.getContractInstance(
      this.claimHelperAddress
    );
    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        claimHelperContract.populateTransaction.claimAndStake(user, stakeToken),
      from: user,
    });

    return {
      tx: txCallback,
      txType: eEthereumTxType.STAKE_ACTION,
      gas: this.generateTxPriceEstimation([], txCallback),
    };
  }
}
