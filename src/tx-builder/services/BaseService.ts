import { BigNumber, Contract, PopulatedTransaction } from 'ethers';
import {
  Configuration,
  tEthereumAddress,
  TransactionGenerationMethod,
  transactionType,
} from '../types';
import { ContractsFactory } from '../interfaces/ContractsFactory';
import { estimateGas } from '../utils/gasStation';
import { DEFAULT_NULL_VALUE_ON_TX, gasLimitRecommendations } from '../config';

export default class BaseService<T extends Contract> {
  readonly contractInstances: { [address: string]: T };

  readonly contractFactory: ContractsFactory;

  readonly config: Configuration;

  constructor(config: Configuration, contractFactory: ContractsFactory) {
    this.config = config;
    this.contractFactory = contractFactory;
    this.contractInstances = {};
  }

  public getContractInstance = (address: tEthereumAddress): T => {
    if (!this.contractInstances[address]) {
      const { provider }: Configuration = this.config;
      this.contractInstances[address] = this.contractFactory.connect(
        address,
        provider
      ) as T;
    }

    return this.contractInstances[address];
  };

  readonly generateTxCallback = ({
    rawTxMethod,
    from,
    value,
    gasSurplus,
    action,
  }: TransactionGenerationMethod): (() => Promise<
    transactionType
  >) => async () => {
    const txRaw: PopulatedTransaction = await rawTxMethod();

    const tx: transactionType = {
      ...txRaw,
      from,
      value: value || DEFAULT_NULL_VALUE_ON_TX,
    };

    tx.gasLimit = await estimateGas(tx, this.config, gasSurplus);

    if (
      action &&
      gasLimitRecommendations[action] &&
      tx.gasLimit.lte(BigNumber.from(gasLimitRecommendations[action].limit))
    ) {
      tx.gasLimit = BigNumber.from(gasLimitRecommendations[action].recommended);
    }

    return tx;
  };
}
