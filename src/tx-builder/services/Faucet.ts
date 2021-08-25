import { DEFAULT_NULL_VALUE_ON_TX } from '../config';
import {
  IFaucet,
  IMinter,
  IFaucet__factory,
  IMinter__factory,
} from '../contract-types';
import FaucetInterface from '../interfaces/Faucet';
import {
  Configuration,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  LendingPoolMarketConfig,
  transactionType,
} from '../types';
import { FaucetParamsType } from '../types/FaucetMethodTypes';
import { mintAmountsPerToken } from '../utils/parsings';
import { FaucetValidator } from '../validators/methodValidators';
import { IsEthAddress } from '../validators/paramValidators';
import BaseService from './BaseService';

export default class FaucetService
  extends BaseService<IMinter>
  implements FaucetInterface {
  readonly faucetAddress: string;

  readonly faucetContract: IFaucet;

  readonly faucetConfig: LendingPoolMarketConfig | undefined;

  constructor(
    config: Configuration,
    faucetConfig: LendingPoolMarketConfig | undefined
  ) {
    super(config, IMinter__factory);

    this.faucetConfig = faucetConfig;

    const { provider } = this.config;

    this.faucetAddress = this.faucetConfig?.FAUCET || '';

    if (this.faucetAddress !== '') {
      this.faucetContract = IFaucet__factory.connect(
        this.faucetAddress,
        provider
      );
    }
  }

  @FaucetValidator
  public async mint(
    @IsEthAddress('userAddress')
    @IsEthAddress('reserve')
    { userAddress, reserve, tokenSymbol }: FaucetParamsType
  ): Promise<EthereumTransactionTypeExtended[]> {
    const amount: string = mintAmountsPerToken[tokenSymbol];

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        this.faucetContract.populateTransaction.mint(reserve, amount),
      from: userAddress,
      value: DEFAULT_NULL_VALUE_ON_TX,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.FAUCET_MINT,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }
}
