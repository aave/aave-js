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
  transactionType,
} from '../types';
import { IncentivesValidator } from '../validators/methodValidators';
import { IsEthAddress, IsEthAddressArray } from '../validators/paramValidators';
import BaseService from './BaseService';

export type ClaimRewardsMethodType = {
  user: string;
  assets: string[];
  amount?: string; //TODO: does it make sense to have amount? shouldn't it be always max?
  to: string;
  stake?: boolean;
};

export interface IncentivesControllerInterface {
  claimRewards: (
    args: ClaimRewardsMethodType
  ) => EthereumTransactionTypeExtended[];
}

export default class IncentivesController
  extends BaseService<IAaveIncentivesController>
  implements IncentivesControllerInterface {
  readonly incentivesControllerAddress: string;

  constructor(config: Configuration) {
    super(config, IAaveIncentivesController__factory);
    const { network } = this.config;
    this.incentivesControllerAddress =
      commonContractAddressBetweenMarketsV2[network].INCENTIVES_CONTROLLER;
  }

  @IncentivesValidator
  public claimRewards(
    @IsEthAddress('user')
    @IsEthAddressArray('assets')
    @IsEthAddress('to')
    {
      user,
      assets,
      amount,
      to,
      stake, // TODO: for now hardcoded to false
    }: ClaimRewardsMethodType
  ): EthereumTransactionTypeExtended[] {
    const incentivesContract: IAaveIncentivesController = this.getContractInstance(
      this.incentivesControllerAddress
    );
    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        incentivesContract.populateTransaction.claimRewards(
          assets,
          constants.MaxUint256.toString(),
          to,
          false
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
