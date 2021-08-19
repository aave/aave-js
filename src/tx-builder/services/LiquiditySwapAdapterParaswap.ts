import {
  IParaSwapLiquiditySwapAdapter__factory,
  IParaSwapLiquiditySwapAdapter,
} from '../contract-types';
import LiquiditySwapAdapterInterface from '../interfaces/LiquiditySwapAdapterParaswap';
import {
  Configuration,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  SwapCollateralConfig,
  transactionType,
} from '../types';
import { SwapAndDepositMethodType } from '../types/LiquiditySwapAdapterParaswapMethodTypes';
import { LiquiditySwapValidator } from '../validators/methodValidators';
import { IsEthAddress, IsPositiveAmount } from '../validators/paramValidators';
import BaseService from './BaseService';

export function augustusFromAmountOffsetFromCalldata(calldata: string) {
  switch (calldata.slice(0, 10)) {
    case '0xda8567c8': // Augustus V3 multiSwap
      return 4 + 32 + 2 * 32;
    case '0x58b9d179': // Augustus V4 swapOnUniswap
      return 4;
    case '0x0863b7ac': // Augustus V4 swapOnUniswapFork
      return 4 + 2 * 32;
    case '0x8f00eccb': // Augustus V4 multiSwap
      return 4 + 32 + 32;
    case '0xec1d21dd': // Augustus V4 megaSwap
      return 4 + 32 + 32;
    default:
      throw new Error('Unrecognized function selector for Augustus');
  }
}

export default class LiquiditySwapAdapterService
  extends BaseService<IParaSwapLiquiditySwapAdapter>
  implements LiquiditySwapAdapterInterface {
  readonly liquiditySwapAdapterAddress: string;

  readonly swapCollateralConfig: SwapCollateralConfig;

  constructor(
    config: Configuration,
    swapCollateralConfig: SwapCollateralConfig
  ) {
    super(config, IParaSwapLiquiditySwapAdapter__factory);
    this.swapCollateralConfig = swapCollateralConfig;

    const { network } = this.config;

    this.liquiditySwapAdapterAddress = this.swapCollateralConfig[
      network
    ].SWAP_COLLATERAL_ADAPTER;
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
          swapAll
            ? augustusFromAmountOffsetFromCalldata(swapCallData as string)
            : 0,
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
