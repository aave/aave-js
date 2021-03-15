import { constants } from 'ethers';
import { commonContractAddressBetweenMarketsV2 } from '../config';
import { IClaimStakingRewardsHelper__factory } from '../contract-types/factories/IClaimStakingRewardsHelper__factory';
import { IClaimStakingRewardsHelper } from '../contract-types/IClaimStakingRewardsHelper';
import {
  Configuration,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  StakeActions,
  tEthereumAddress,
  transactionType,
  tStringCurrencyUnits,
} from '../types';
import { StakingValidator } from '../validators/methodValidators';
import {
  IsEthAddress,
  IsPositiveOrMinusOneAmount,
} from '../validators/paramValidators';
import BaseService from './BaseService';

export interface ClaimStakingRewardsHelperInterface {
  claimAllRewards: (
    user: tEthereumAddress
    // amount: tStringCurrencyUnits
  ) => EthereumTransactionTypeExtended;
  claimAllRewardsAndStake: (
    user: tEthereumAddress
    // amount: tStringCurrencyUnits
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
  @StakingValidator(StakeActions.claimAllRewards)
  public claimAllRewards(
    @IsEthAddress() user: tEthereumAddress
    // @IsPositiveOrMinusOneAmount() amount: tStringCurrencyUnits
  ): EthereumTransactionTypeExtended {
    const claimHelperContract: IClaimStakingRewardsHelper = this.getContractInstance(
      this.claimHelperAddress
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        claimHelperContract.populateTransaction.claimAllRewards(
          user,
          constants.MaxUint256.toString()
        ),
      from: user,
    });

    return {
      tx: txCallback,
      txType: eEthereumTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation([], txCallback),
    };
  }

  @StakingValidator(StakeActions.claimAllRewardsAndStake)
  public claimAllRewardsAndStake(
    @IsEthAddress() user: tEthereumAddress
    // @IsPositiveOrMinusOneAmount() amount: tStringCurrencyUnits
  ): EthereumTransactionTypeExtended {
    const claimHelperContract: IClaimStakingRewardsHelper = this.getContractInstance(
      this.claimHelperAddress
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        claimHelperContract.populateTransaction.claimAllRewardsAndStake(
          user,
          constants.MaxUint256.toString()
        ),
      from: user,
    });

    return {
      tx: txCallback,
      txType: eEthereumTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation([], txCallback),
    };
  }
}
