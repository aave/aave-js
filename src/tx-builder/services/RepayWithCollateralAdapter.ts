import { commonContractAddressBetweenMarketsV2 } from '../config';
import {
  IRepayWithCollateral,
  IRepayWithCollateral__factory,
} from '../contract-types';
import RepayWithCollateralAdapterInterface from '../interfaces/RepayWithCollateralAdapter';
import {
  Configuration,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  transactionType,
} from '../types';
import { RepayWithCollateralType } from '../types/RepayWithCollateralMethodTypes';
import { RepayWithCollateralValidator } from '../validators/methodValidators';
import { IsEthAddress, IsPositiveAmount } from '../validators/paramValidators';
import BaseService from './BaseService';

export default class RepayWithCollateralAdapterService
  extends BaseService<IRepayWithCollateral>
  implements RepayWithCollateralAdapterInterface {
  readonly repayWithCollateralAddress: string;

  constructor(config: Configuration) {
    super(config, IRepayWithCollateral__factory);

    const {
      REPAY_WITH_COLLATERAL_ADAPTER,
    } = commonContractAddressBetweenMarketsV2[this.config.network];

    this.repayWithCollateralAddress = REPAY_WITH_COLLATERAL_ADAPTER;
  }

  @RepayWithCollateralValidator
  public swapAndRepay(
    @IsEthAddress('user')
    @IsEthAddress('collateralAsset')
    @IsEthAddress('debtAsset')
    @IsPositiveAmount('collateralAmount')
    @IsPositiveAmount('debtRepayAmount')
    {
      user,
      collateralAsset,
      debtAsset,
      collateralAmount,
      debtRepayAmount,
      debtRateMode,
      permit,
      useEthPath,
    }: RepayWithCollateralType
  ): EthereumTransactionTypeExtended {
    const repayWithCollateralContract: IRepayWithCollateral = this.getContractInstance(
      this.repayWithCollateralAddress
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        repayWithCollateralContract.populateTransaction.swapAndRepay(
          collateralAsset,
          debtAsset,
          collateralAmount,
          debtRepayAmount,
          debtRateMode,
          permit,
          useEthPath || false
        ),
      from: user,
    });

    return {
      tx: txCallback,
      txType: eEthereumTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation(txCallback),
    };
  }
}
