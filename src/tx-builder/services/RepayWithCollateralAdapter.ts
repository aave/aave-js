import {
  IRepayWithCollateral,
  IRepayWithCollateral__factory,
} from '../contract-types';
import RepayWithCollateralAdapterInterface from '../interfaces/RepayWithCollateralAdapter';
import {
  Configuration,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  LendingPoolMarketConfig,
  ProtocolAction,
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

  readonly repayWithCollateralConfig: LendingPoolMarketConfig | undefined;

  constructor(
    config: Configuration,
    repayWithCollateralConfig: LendingPoolMarketConfig | undefined
  ) {
    super(config, IRepayWithCollateral__factory);
    this.repayWithCollateralConfig = repayWithCollateralConfig;

    this.repayWithCollateralAddress =
      this.repayWithCollateralConfig?.REPAY_WITH_COLLATERAL_ADAPTER || '';
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
    }: RepayWithCollateralType,
    txs?: EthereumTransactionTypeExtended[]
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
      gas: this.generateTxPriceEstimation(
        txs || [],
        txCallback,
        ProtocolAction.repayCollateral
      ),
    };
  }
}
