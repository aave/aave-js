import {
  IParaSwapLiquiditySwapAdapter__factory,
  IParaSwapLiquiditySwapAdapter,
} from '../contract-types';
import LiquiditySwapAdapterInterface from '../interfaces/LiquiditySwapAdapterParaswap';
import {
  Configuration,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  LendingPoolMarketConfig,
  ProtocolAction,
  transactionType,
} from '../types';
import { SwapAndDepositMethodType } from '../types/LiquiditySwapAdapterParaswapMethodTypes';
import { LiquiditySwapValidator } from '../validators/methodValidators';
import { IsEthAddress, IsPositiveAmount } from '../validators/paramValidators';
import BaseService from './BaseService';

export function augustusFromAmountOffsetFromCalldata(calldata: string) {
  switch (calldata.slice(0, 10)) {
    case '0xda8567c8': // Augustus V3 multiSwap
      return 100; // 4 + 3 * 32
    case '0x58b9d179': // Augustus V4 swapOnUniswap
      return 4; // 4 + 0 * 32
    case '0x0863b7ac': // Augustus V4 swapOnUniswapFork
      return 68; // 4 + 2 * 32
    case '0x8f00eccb': // Augustus V4 multiSwap
      return 68; // 4 + 2 * 32
    case '0xec1d21dd': // Augustus V4 megaSwap
      return 68; // 4 + 2 * 32
    case '0x54840d1a': // Augustus V5 swapOnUniswap
      return 4; // 4 + 0 * 32
    case '0xf5661034': // Augustus V5 swapOnUniswapFork
      return 68; // 4 + 2 * 32
    case '0x64466805': // Augustus V5 swapOnZeroXv4
      return 68; // 4 + 2 * 32
    case '0xa94e78ef': // Augustus V5 multiSwap
      return 68; // 4 + 2 * 32
    case '0x46c67b6d': // Augustus V5 megaSwap
      return 68; // 4 + 2 * 32
    default:
      throw new Error('Unrecognized function selector for Augustus');
  }
}

export default class LiquiditySwapAdapterService
  extends BaseService<IParaSwapLiquiditySwapAdapter>
  implements LiquiditySwapAdapterInterface {
  readonly liquiditySwapAdapterAddress: string;

  readonly swapCollateralConfig: LendingPoolMarketConfig | undefined;

  constructor(
    config: Configuration,
    swapCollateralConfig: LendingPoolMarketConfig | undefined
  ) {
    super(config, IParaSwapLiquiditySwapAdapter__factory);
    this.swapCollateralConfig = swapCollateralConfig;

    this.liquiditySwapAdapterAddress =
      this.swapCollateralConfig?.SWAP_COLLATERAL_ADAPTER || '';
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
    }: SwapAndDepositMethodType,
    txs?: EthereumTransactionTypeExtended[]
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
      gas: this.generateTxPriceEstimation(
        txs || [],
        txCallback,
        ProtocolAction.swapCollateral
      ),
    };
  }
}
