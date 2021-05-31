import { commonContractAddressBetweenMarketsV2 } from '../config';
import { ISwapCollateral__factory, ISwapCollateral } from '../contract-types';
import LiquiditySwapAdapterInterface from '../interfaces/LiquiditySwapAdapter';
import {
  Configuration,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  transactionType,
} from '../types';
import { SwapAndDepositMethodType } from '../types/LiquiditySwapAdapterMethodTypes';
import { LiquiditySwapValidator } from '../validators/methodValidators';
import { IsEthAddress, IsPositiveAmount } from '../validators/paramValidators';
import BaseService from './BaseService';

export default class LiquiditySwapAdapterService
  extends BaseService<ISwapCollateral>
  implements LiquiditySwapAdapterInterface
{
  readonly liquiditySwapAdapterAddress: string;

  constructor(config: Configuration) {
    super(config, ISwapCollateral__factory);

    const { SWAP_COLLATERAL_ADAPTER } =
      commonContractAddressBetweenMarketsV2[this.config.network];
    this.liquiditySwapAdapterAddress = SWAP_COLLATERAL_ADAPTER;
  }

  @LiquiditySwapValidator
  public swapAndDeposit(
    @IsEthAddress('user')
    @IsEthAddress('assetToSwapFrom')
    @IsEthAddress('assetToSwapTo')
    @IsPositiveAmount('amountToSwap')
    @IsPositiveAmount('minAmountToReceive')
    {
      user,
      assetToSwapFrom,
      assetToSwapTo,
      amountToSwap,
      minAmountToReceive,
      permitParams,
      useEthPath,
    }: SwapAndDepositMethodType
  ): EthereumTransactionTypeExtended {
    const liquiditySwapContract = this.getContractInstance(
      this.liquiditySwapAdapterAddress
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        liquiditySwapContract.populateTransaction.swapAndDeposit(
          [assetToSwapFrom],
          [assetToSwapTo],
          [amountToSwap],
          [minAmountToReceive],
          [permitParams],
          [useEthPath || false]
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
