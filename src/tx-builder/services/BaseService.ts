import { BigNumber, Contract, PopulatedTransaction } from 'ethers';
import {
  Configuration,
  tEthereumAddress,
  TransactionGenerationMethod,
  transactionType,
  GasResponse,
  ProtocolAction,
} from '../types';
import { ContractsFactory } from '../interfaces/ContractsFactory';
import { estimateGas, getGasPrice } from '../utils/gasStation';
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
  }: TransactionGenerationMethod): (() => Promise<transactionType>) => async () => {
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

  readonly generateTxPriceEstimation = (
    txCallback: () => Promise<transactionType>,
    action: string = ProtocolAction.default
  ): GasResponse => async (skipCalculation) => {
    try {
      const gasPrice = await getGasPrice(this.config);

      if (!skipCalculation) {
        const { gasLimit, gasPrice }: transactionType = await txCallback();
        if (!gasLimit || !gasPrice) {
          // If we don't recieve the correct gas we throw a error
          throw new Error('Transaction calculation error');
        }

        return {
          gasLimit: gasLimit.toString(),
          gasPrice: gasPrice.toString(),
        };
      }

      return {
        gasLimit: gasLimitRecommendations[action].recommended,
        gasPrice: gasPrice.toString(),
      };
    } catch (error) {
      console.error('Calculate error on calculate estimation gas price.');
      return null;
    }
  };
}
