import {
  commonContractAddressBetweenMarketsV2,
  DEFAULT_NULL_VALUE_ON_TX,
  enabledNetworksByService,
} from '../config';
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
  tEthereumAddress,
  transactionType,
  tStringDecimalUnits,
} from '../types';
import { FaucetParamsType } from '../types/FaucetMethodTypes';
import { mintAmountsPerToken } from '../utils/parsings';
import { FaucetValidator } from '../validators/methodValidators';
import { IsEthAddress } from '../validators/paramValidators';
import BaseService from './BaseService';

export default class FaucetService extends BaseService<IMinter>
  implements FaucetInterface {
  readonly faucetAddress: string;

  readonly faucetContract: IFaucet;

  constructor(config: Configuration) {
    super(config, IMinter__factory);

    const { provider, network } = this.config;

    const { FAUCET } = commonContractAddressBetweenMarketsV2[network];
    this.faucetAddress = FAUCET;

    if (enabledNetworksByService.faucet.indexOf(network) > -1) {
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
    const txValue = await this.getTxValue(reserve, amount);

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        this.faucetContract.populateTransaction.mint(reserve, amount),
      from: userAddress,
      value: txValue,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.FAUCET_MINT,
      },
    ];
  }

  private async getTxValue(
    token: tEthereumAddress,
    amount: tStringDecimalUnits
  ): Promise<tStringDecimalUnits> {
    const minterAddress: string = await this.faucetContract.getMinter(token);
    const minterContract: IMinter = this.getContractInstance(minterAddress);

    const isEthRequired: boolean = await minterContract.isEthRequired();

    return isEthRequired ? amount : DEFAULT_NULL_VALUE_ON_TX;
  }
}
