import { BigNumber } from 'ethers';
import { IDebtTokenBase, IDebtTokenBase__factory } from '../contract-types';
import BaseDebtTokenInterface from '../interfaces/BaseDebtToken';
import IERC20ServiceInterface from '../interfaces/ERC20';
import {
  Configuration,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  tEthereumAddress,
  transactionType,
  tStringCurrencyUnits,
  tStringDecimalUnits,
} from '../types';
import { parseNumber } from '../utils/parsings';
import BaseService from './BaseService';

export default class BaseDebtToken
  extends BaseService<IDebtTokenBase>
  implements BaseDebtTokenInterface {
  readonly erc20Service: IERC20ServiceInterface;

  constructor(config: Configuration, erc20Service: IERC20ServiceInterface) {
    super(config, IDebtTokenBase__factory);
    this.erc20Service = erc20Service;
  }

  public approveDelegation(
    user: tEthereumAddress,
    delegatee: tEthereumAddress,
    debtTokenAddress: tEthereumAddress,
    amount: tStringDecimalUnits
  ): EthereumTransactionTypeExtended {
    const debtTokenContract: IDebtTokenBase = this.getContractInstance(
      debtTokenAddress
    );
    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        debtTokenContract.populateTransaction.approveDelegation(
          delegatee,
          amount
        ),
      from: user,
    });

    return {
      tx: txCallback,
      txType: eEthereumTxType.ERC20_APPROVAL,
      gas: this.generateTxPriceEstimation([], txCallback),
    };
  }

  public async isDelegationApproved(
    debtTokenAddress: tEthereumAddress,
    allowanceGiver: tEthereumAddress,
    allowanceReceiver: tEthereumAddress,
    amount: tStringCurrencyUnits
  ): Promise<boolean> {
    const decimals: number = await this.erc20Service.decimalsOf(
      debtTokenAddress
    );
    const debtTokenContract: IDebtTokenBase = this.getContractInstance(
      debtTokenAddress
    );
    const delegatedAllowance: BigNumber = await debtTokenContract.borrowAllowance(
      allowanceGiver,
      allowanceReceiver
    );
    const amountBNWithDecimals: BigNumber = BigNumber.from(
      parseNumber(amount, decimals)
    );

    return delegatedAllowance.gt(amountBNWithDecimals);
  }
}
