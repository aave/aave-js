import IERC20ServiceInterface from '../interfaces/ERC20';
import {
  commonContractAddressBetweenMarketsV2,
  DEFAULT_APPROVE_AMOUNT,
} from '../config';
import {
  ILendToAaveMigrator,
  ILendToAaveMigrator__factory,
} from '../contract-types';
import LTAMigratorInterface from '../interfaces/LTAMigrator';
import {
  Configuration,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  Network,
  tEthereumAddress,
  transactionType,
  tStringCurrencyUnits,
} from '../types';
import { parseNumber } from '../utils/parsings';
import BaseService from './BaseService';

export default class LTAMigratorService extends BaseService<ILendToAaveMigrator>
  implements LTAMigratorInterface {
  readonly erc20Service: IERC20ServiceInterface;

  readonly migratorAddress: string;

  constructor(config: Configuration, erc20Service: IERC20ServiceInterface) {
    super(config, ILendToAaveMigrator__factory);
    this.erc20Service = erc20Service;
    const { network }: Configuration = this.config;

    this.migratorAddress =
      commonContractAddressBetweenMarketsV2[network].LEND_TO_AAVE_MIGRATOR;
  }

  public migrateLendToAave = async (
    user: tEthereumAddress,
    amount: tStringCurrencyUnits
  ): Promise<EthereumTransactionTypeExtended[]> => {
    const txs: EthereumTransactionTypeExtended[] = [];
    // TODO: delete conditional when mainnet address
    if (this.config.network === Network.ropsten) {
      return txs;
    }

    const { isApproved, approve, decimalsOf } = this.erc20Service;

    const migratorContract: ILendToAaveMigrator = this.getContractInstance(
      this.migratorAddress
    );
    const lendToken: string = await migratorContract.LEND();

    const approved: boolean = await isApproved(
      lendToken,
      user,
      this.migratorAddress,
      amount
    );

    if (!approved) {
      txs.push(
        approve(user, lendToken, this.migratorAddress, DEFAULT_APPROVE_AMOUNT)
      );
    }

    const decimals: number = await decimalsOf(lendToken);
    const convertedAmount: string = await parseNumber(amount, decimals);

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        migratorContract.populateTransaction.migrateFromLEND(convertedAmount),
      from: user,
    });

    txs.push({
      txType: eEthereumTxType.MIGRATION_LEND_AAVE,
      tx: txCallback,
      gas: this.generateTxPriceEstimation(txCallback),
    });

    return txs;
  };
}
