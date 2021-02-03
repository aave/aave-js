import { EthereumTransactionTypeExtended } from '../../types';
import {
  LPBorrowParamsType,
  LPDepositParamsType,
  LPLiquidationCall,
  LPRepayParamsType,
  LPRepayWithCollateral,
  LPSetUsageAsCollateral,
  LPSwapBorrowRateMode,
  LPSwapCollateral,
  LPWithdrawParamsType,
  LPFlashLiquidation,
} from '../../types/LendingPoolMethodTypes';

export default interface LendingPoolInterface {
  deposit: (
    args: LPDepositParamsType
  ) => Promise<EthereumTransactionTypeExtended[]>;
  withdraw: (
    args: LPWithdrawParamsType
  ) => Promise<EthereumTransactionTypeExtended[]>;
  // delegateBorrowAllowance: (
  //   user: tEthereumAddress,
  //   asset: tEthereumAddress,
  //   interestRateMode: InterestRate,
  //   amount: tStringCurrencyUnits,
  // ) => Promise<EthereumTransactionTypeExtended[]>;
  borrow: (
    args: LPBorrowParamsType
  ) => Promise<EthereumTransactionTypeExtended[]>;
  repay: (
    args: LPRepayParamsType
  ) => Promise<EthereumTransactionTypeExtended[]>;
  swapBorrowRateMode: (
    args: LPSwapBorrowRateMode
  ) => Promise<EthereumTransactionTypeExtended[]>;
  // rebalanceStableBorrowRate: (
  //   user: tEthereumAddress,
  //   reserve: tEthereumAddress,
  // ) => Promise<EthereumTransactionTypeExtended[]>;
  setUsageAsCollateral: (
    args: LPSetUsageAsCollateral
  ) => Promise<EthereumTransactionTypeExtended[]>;
  liquidationCall: (
    args: LPLiquidationCall
  ) => Promise<EthereumTransactionTypeExtended[]>;
  swapCollateral: (
    args: LPSwapCollateral
  ) => Promise<EthereumTransactionTypeExtended[]>;
  repayWithCollateral: (
    args: LPRepayWithCollateral
  ) => Promise<EthereumTransactionTypeExtended[]>;
  flashLiquidation(
    args: LPFlashLiquidation
  ): Promise<EthereumTransactionTypeExtended[]>;
}
