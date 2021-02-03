import { utils, constants } from 'ethers';

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
import { parseNumber } from '../../utils/parsings';
import { Liquidation } from '../../types/FlashLiquidationAdapter';
import FlashLiquidationAdapterInterface from '../../interfaces/v2/FlashLiquidationAdapter';
import IERC20ServiceInterface from '../../interfaces/ERC20';
import BaseService from '../BaseService';

export default class FlashLiquidationAdapterService
  extends BaseService<ILendingPool>
  implements FlashLiquidationAdapterInterface {
  readonly flashLiquidation: string;
  readonly lendingPoolAddress: string;
  readonly market: Market;
  readonly flashLiquidationContract: IFlashLiquidationAdapter;
  readonly erc20Service: IERC20ServiceInterface;

  constructor(
    config: Configuration,
    market: Market,
    erc20Service: IERC20ServiceInterface
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
    @IsEthAddress('initiator')
    {
      user,
      collateralAsset,
      borrowedAsset,
      debtTokenCover,
      liquidateAll,
      initiator,
      useEthPath,
    }: Liquidation
  ): Promise<EthereumTransactionTypeExtended[]> {
    const addSurplus = (amount: string): string => {
      return (
        Number(amount) +
        (Number(amount) * Number(amount)) / 100
      ).toString();
    };

    const txs: EthereumTransactionTypeExtended[] = [];

    const lendingPoolContract: ILendingPool = this.getContractInstance(
      this.lendingPoolAddress
    );

    const tokenDecimals: number = await this.erc20Service.decimalsOf(
      borrowedAsset
    );

    const convertedDebt = parseNumber(debtTokenCover, tokenDecimals);

    const convertedDebtTokenCover: string = liquidateAll
      ? constants.MaxUint256.toString()
      : convertedDebt;

    const flashBorrowAmount = liquidateAll
      ? parseNumber(addSurplus(debtTokenCover), tokenDecimals)
      : convertedDebt;

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
          [flashBorrowAmount],
          [0],
          initiator,
          params,
          '0'
        ),
      from: user,
    });

    txs.push({ tx: txCallback, txType: eEthereumTxType.DLP_ACTION });
    return txs;
  }
}
