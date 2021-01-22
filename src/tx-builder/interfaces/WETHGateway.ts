import { EthereumTransactionTypeExtended } from '../types';
import {
  WETHBorrowParamsType,
  WETHDepositParamsType,
  WETHRepayParamsType,
  WETHWithdrawParamsType,
} from '../types/WethGatewayMethodTypes';

export default interface WETHGatewayInterface {
  depositETH: (
    args: WETHDepositParamsType
  ) => Promise<EthereumTransactionTypeExtended[]>;
  withdrawETH: (
    args: WETHWithdrawParamsType
  ) => Promise<EthereumTransactionTypeExtended[]>;
  repayETH: (
    args: WETHRepayParamsType
  ) => Promise<EthereumTransactionTypeExtended[]>;
  borrowETH: (
    args: WETHBorrowParamsType
  ) => Promise<EthereumTransactionTypeExtended[]>;
}
