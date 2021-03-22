import { commonContractAddressBetweenMarketsV2 } from '../config';
import {
  IParaSwapLiquiditySwapAdapter__factory,
  IParaSwapLiquiditySwapAdapter,
} from '../contract-types';
import LiquiditySwapAdapterInterface from '../interfaces/LiquiditySwapAdapterParaswap';
import {
  Configuration,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  transactionType,
} from '../types';
import { SwapAndDepositMethodType } from '../types/LiquiditySwapAdapterParaswapMethodTypes';
import { LiquiditySwapValidator } from '../validators/methodValidators';
import { IsEthAddress, IsPositiveAmount } from '../validators/paramValidators';
import BaseService from './BaseService';

export default class LiquiditySwapAdapterService
  extends BaseService<IParaSwapLiquiditySwapAdapter>
  implements LiquiditySwapAdapterInterface {
  readonly liquiditySwapAdapterAddress: string;

  constructor(config: Configuration) {
    super(config, IParaSwapLiquiditySwapAdapter__factory);

    console.log('nw', this.config.network);
    const { SWAP_COLLATERAL_ADAPTER } = commonContractAddressBetweenMarketsV2[
      this.config.network
    ];
    this.liquiditySwapAdapterAddress = SWAP_COLLATERAL_ADAPTER;
  }

  @LiquiditySwapValidator
  public swapAndDeposit(
    @IsEthAddress('user')
    @IsEthAddress('assetToSwapFrom')
    @IsEthAddress('assetToSwapTo')
    @IsEthAddress('augustus')
    @IsPositiveAmount('amountToSwap')
    @IsPositiveAmount('minAmountToReceive')
    {
      user,
      assetToSwapFrom,
      assetToSwapTo,
      amountToSwap,
      minAmountToReceive,
      permitParams,
      augustus,
      swapCallData,
      swapAll,
    }: SwapAndDepositMethodType
  ): EthereumTransactionTypeExtended {
    const liquiditySwapContract = this.getContractInstance(
      this.liquiditySwapAdapterAddress
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        liquiditySwapContract.populateTransaction.swapAndDeposit(
          assetToSwapFrom,
          assetToSwapTo,
          amountToSwap,
          minAmountToReceive,
          swapAll ? 4 + 2 * 32 : 0,
          swapCallData,
          augustus,
          permitParams
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
