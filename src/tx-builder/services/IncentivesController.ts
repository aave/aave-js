import { constants } from 'ethers';
import { commonContractAddressBetweenMarketsV2 } from '../config';
import {
  IAaveIncentivesController,
  IAaveIncentivesController__factory,
} from '../contract-types';
import {
  Configuration,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  tEthereumAddress,
  transactionType,
} from '../types';
import { IncentivesValidator } from '../validators/methodValidators';
import { IsEthAddress } from '../validators/paramValidators';
import BaseService from './BaseService';

export type ClaimRewardsMethodType = {
  user: string;
  assets: string[];
  to: string;
};

export interface IncentivesControllerInterface {
  incentivesControllerRewardTokenAddress: tEthereumAddress;
  claimRewards: (
    args: ClaimRewardsMethodType
  ) => EthereumTransactionTypeExtended[];
}

export default class IncentivesController
  extends BaseService<IAaveIncentivesController>
  implements IncentivesControllerInterface {
  public readonly incentivesControllerRewardTokenAddress: tEthereumAddress;
  readonly incentivesControllerAddress: string;

  constructor(config: Configuration) {
    super(config, IAaveIncentivesController__factory);
    const { network } = this.config;
    const addresses = commonContractAddressBetweenMarketsV2[network];
    this.incentivesControllerAddress = addresses.INCENTIVES_CONTROLLER;
    this.incentivesControllerRewardTokenAddress =
      addresses.INCENTIVES_CONTROLLER_REWARD_TOKEN;
  }

  @IncentivesValidator
  public claimRewards(
    @IsEthAddress('user')
    // @IsEthAddressArray('assets')
    @IsEthAddress('to')
    { user, assets, to }: ClaimRewardsMethodType
  ): EthereumTransactionTypeExtended[] {
    const incentivesContract: IAaveIncentivesController = this.getContractInstance(
      this.incentivesControllerAddress
    );
    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        incentivesContract.populateTransaction.claimRewards(
          assets,
          constants.MaxUint256.toString(),
          to || user
        ),
      from: user,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.REWARD_ACTION,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }
}
