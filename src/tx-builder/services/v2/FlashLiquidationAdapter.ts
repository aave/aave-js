import { utils, parseNumber } from 'ethers';

import {
  commonContractAddressBetweenMarketsV2,
  distinctContractAddressBetweenMarketsV2,
} from '../../config';

import {
  ILendingPool,
  ILendingPool__factory,
  IFlashLiquidationAdapter,
  IFlashLiquidationAdapter__factory,
} from '../../contract-types';

import {
  IsEthAddress,
  IsPositiveAmount,
} from '../../validators/paramValidators';

import {
  Configuration,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  Market,
  transactionType,
} from '../../types';

import { Liquidation } from '../../types/FlashLiquidationAdapter';
import FlashLiquidationAdapterInterface from '../../interfaces/v2/FlashLiquidationAdapter';
import ERC20Service from '../ERC20';
import BaseService from '../BaseService';

export default class FlashLiquidationAdapterService
  extends BaseService<ILendingPool>
  implements FlashLiquidationAdapterInterface {
  readonly flashLiquidation: string;
  readonly lendingPoolAddress: string;
  readonly market: Market;
  readonly flashLiquidationContract: IFlashLiquidationAdapter;
  readonly erc20Service: ERC20Service;

  constructor(
    config: Configuration,
    market: Market,
    erc20Service: ERC20Service
  ) {
    super(config, ILendingPool__factory);
    this.market = market;
    this.erc20Service = erc20Service;
    const { network } = this.config;
    this.lendingPoolAddress =
      distinctContractAddressBetweenMarketsV2[this.market][
        network
      ].LENDINGPOOL_ADDRESS;
    this.flashLiquidation =
      commonContractAddressBetweenMarketsV2[network].FLASHLIQUIDATION;

    if (this.flashLiquidation !== '') {
      this.flashLiquidationContract = IFlashLiquidationAdapter__factory.connect(
        this.flashLiquidation,
        this.config.provider
      );
    }
  }

  public async liquidation(
    @IsEthAddress('user')
    @IsEthAddress('collateralAsset')
    @IsEthAddress('borrowedAsset')
    @IsPositiveAmount('debtTokenCover')
    @IsPositiveAmount('premium')
    @IsEthAddress('onBehalfOf')
    {
      user,
      collateralAsset,
      borrowedAsset,
      debtTokenCover,
      onBehalfOf,
      useEthPath,
    }: Liquidation
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];

    const lendingPoolContract: ILendingPool = this.getContractInstance(
      this.lendingPoolAddress
    );

    const tokenDecimals: number = await this.erc20Service.decimalsOf(
      borrowedAsset
    );

    const convertedDebtTokenCover: string = parseNumber(
      debtTokenCover,
      tokenDecimals
    );

    const params: string = utils.defaultAbiCoder.encode(
      ['address', 'address', 'address', 'uint256', 'bool[]'],
      [
        [collateralAsset],
        [borrowedAsset],
        [user],
        [convertedDebtTokenCover],
        [useEthPath] || false,
      ]
    );
    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        lendingPoolContract.populateTransaction.flashLoan(
          this.flashLiquidation,
          [borrowedAsset],
          [convertedDebtTokenCover],
          [0],
          onBehalfOf,
          params,
          '0'
        ),
      from: user,
    });

    txs.push({ tx: txCallback, txType: eEthereumTxType.DLP_ACTION });
    return txs;
  }
}
