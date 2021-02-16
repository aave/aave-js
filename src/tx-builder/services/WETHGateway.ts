import { constants } from 'ethers';
import { commonContractAddressBetweenMarketsV2 } from '../config';
import { IWETHGateway, IWETHGateway__factory } from '../contract-types';
import BaseDebtTokenInterface from '../interfaces/BaseDebtToken';
import IERC20ServiceInterface from '../interfaces/ERC20';
import WETHGatewayInterface from '../interfaces/WETHGateway';
import {
  Configuration,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  InterestRate,
  ProtocolAction,
  transactionType,
  tStringDecimalUnits,
} from '../types';
import {
  WETHBorrowParamsType,
  WETHDepositParamsType,
  WETHRepayParamsType,
  WETHWithdrawParamsType,
} from '../types/WethGatewayMethodTypes';
import { parseNumber } from '../utils/parsings';
import { WETHValidator } from '../validators/methodValidators';
import {
  IsEthAddress,
  IsPositiveAmount,
  IsPositiveOrMinusOneAmount,
} from '../validators/paramValidators';
import BaseService from './BaseService';

export default class WETHGatewayService
  extends BaseService<IWETHGateway>
  implements WETHGatewayInterface {
  readonly wethGatewayAddress: string;

  readonly config: Configuration;

  readonly baseDebtTokenService: BaseDebtTokenInterface;

  readonly erc20Service: IERC20ServiceInterface;

  constructor(
    config: Configuration,
    baseDebtTokenService: BaseDebtTokenInterface,
    erc20Service: IERC20ServiceInterface
  ) {
    super(config, IWETHGateway__factory);
    this.config = config;
    this.baseDebtTokenService = baseDebtTokenService;
    this.erc20Service = erc20Service;

    const { network } = this.config;
    const { WETH_GATEWAY } = commonContractAddressBetweenMarketsV2[network];

    this.wethGatewayAddress = WETH_GATEWAY;
  }

  @WETHValidator
  public async depositETH(
    @IsEthAddress('user')
    @IsEthAddress('onBehalfOf')
    @IsPositiveAmount('amount')
    { user, amount, onBehalfOf, referralCode }: WETHDepositParamsType
  ): Promise<EthereumTransactionTypeExtended[]> {
    const convertedAmount: tStringDecimalUnits = parseNumber(amount, 18);

    const wethGatewayContract: IWETHGateway = this.getContractInstance(
      this.wethGatewayAddress
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        wethGatewayContract.populateTransaction.depositETH(
          onBehalfOf || user,
          referralCode || '0'
        ),
      from: user,
      value: convertedAmount,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.DLP_ACTION,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }

  @WETHValidator
  public async borrowETH(
    @IsEthAddress('user')
    @IsPositiveAmount('amount')
    @IsEthAddress('debtTokenAddress')
    {
      user,
      amount,
      debtTokenAddress,
      interestRateMode,
      referralCode,
    }: WETHBorrowParamsType
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];
    const convertedAmount: tStringDecimalUnits = parseNumber(amount, 18);
    const numericRateMode = interestRateMode === InterestRate.Variable ? 2 : 1;

    const delegationApproved: boolean = await this.baseDebtTokenService.isDelegationApproved(
      debtTokenAddress,
      user,
      this.wethGatewayAddress,
      amount
    );

    if (!delegationApproved) {
      const approveDelegationTx: EthereumTransactionTypeExtended = this.baseDebtTokenService.approveDelegation(
        user,
        this.wethGatewayAddress,
        debtTokenAddress,
        constants.MaxUint256.toString()
      );

      txs.push(approveDelegationTx);
    }
    const wethGatewayContract: IWETHGateway = this.getContractInstance(
      this.wethGatewayAddress
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        wethGatewayContract.populateTransaction.borrowETH(
          convertedAmount,
          numericRateMode,
          referralCode || '0'
        ),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation(
        txs,
        txCallback,
        ProtocolAction.borrowETH
      ),
    });

    return txs;
  }

  @WETHValidator
  public async withdrawETH(
    @IsEthAddress('user')
    @IsEthAddress('onBehalfOf')
    @IsPositiveOrMinusOneAmount('amount')
    @IsEthAddress('aTokenAddress')
    { user, amount, onBehalfOf, aTokenAddress }: WETHWithdrawParamsType
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];
    const { isApproved, approve }: IERC20ServiceInterface = this.erc20Service;
    const convertedAmount: tStringDecimalUnits =
      amount === '-1'
        ? constants.MaxUint256.toString()
        : parseNumber(amount, 18);

    const approved: boolean = await isApproved(
      aTokenAddress,
      user,
      this.wethGatewayAddress,
      amount
    );

    if (!approved) {
      const approveTx: EthereumTransactionTypeExtended = approve(
        user,
        aTokenAddress,
        this.wethGatewayAddress,
        constants.MaxUint256.toString()
      );
      txs.push(approveTx);
    }
    const wethGatewayContract: IWETHGateway = this.getContractInstance(
      this.wethGatewayAddress
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        wethGatewayContract.populateTransaction.withdrawETH(
          convertedAmount,
          onBehalfOf || user
        ),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation(
        txs,
        txCallback,
        ProtocolAction.withdrawETH
      ),
    });

    return txs;
  }

  @WETHValidator
  public async repayETH(
    @IsEthAddress('user')
    @IsEthAddress('onBehalfOf')
    @IsPositiveAmount('amount')
    { user, amount, interestRateMode, onBehalfOf }: WETHRepayParamsType
  ): Promise<EthereumTransactionTypeExtended[]> {
    const convertedAmount: tStringDecimalUnits = parseNumber(amount, 18);
    const numericRateMode = interestRateMode === InterestRate.Variable ? 2 : 1;
    const wethGatewayContract: IWETHGateway = this.getContractInstance(
      this.wethGatewayAddress
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        wethGatewayContract.populateTransaction.repayETH(
          convertedAmount,
          numericRateMode,
          onBehalfOf || user
        ),
      from: user,
      value: convertedAmount,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.DLP_ACTION,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }
}
