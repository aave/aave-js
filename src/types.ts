import { TransactionObject } from 'web3/eth/types';

export type ResponseCodes = 200 | 401 | 404 | 500 | 504

type Currency = {
  value: string,
  description: string,
  subChoices?: Array<Currency>
}

export interface LoanRequestsMetadata {
  mediums: Array<Currency>,
  collaterals: Array<Currency>,
  durationRange: { min: number, max: number }
}

export interface LoanRequestModel {
  loanAddress?: string;
  loanAmount: number;
  collateralAmount: number;
  mpr: number;
  collateralType: string;
  moe: string;
  duration: number;
  state?:string;
  borrower?: string;
  fundedAmount?: number;
  outstandingLoanAmount: number,
  startTimeoutTime?: number;
  isPeggedLoan: boolean;
  isCrowdLendingLoan: boolean;
  peggedCurrency?: string;
  peggedMedium?: string;
  type: string;
}

export interface BaseResponse {
  data?: any,
  error?: string,
  code: ResponseCodes,
}

export interface LoanRequestTransactionResponse extends BaseResponse {
  data?: TransactionObject<any>
}

export interface LoanRequestResponse extends BaseResponse {
  data?: LoanRequestModel
}

export interface LoanRequestMetadataResponse extends BaseResponse {
  data?: LoanRequestsMetadata
}

export interface LoanRequestsAddressesResponse extends BaseResponse {
  data?: string[]
}

export interface LoanAddressesByBorrowerResponse extends BaseResponse {
  data?: {
    requestsAsBorrower: string[],
    requestsAsLender: string[]
  }
}

export interface EthlendAPIInstance {
  createLoanRequest(borrowerAddress: string, params: LoanRequestModel): Promise<LoanRequestTransactionResponse>
  placeLoanRequestCollateral(loanAddress: string, borrowerAddress: string): Promise<LoanRequestTransactionResponse>
  placeLoanRequestPayback(loanAddress: string, borrowerAddress: string): Promise<LoanRequestTransactionResponse>
  getLoanRequestData(loanAddress: string): Promise<LoanRequestResponse>
  getAllLoanRequestsAddresses(): Promise<LoanRequestsAddressesResponse>
  getLoansByBorrower(borrowerAddress: string): Promise<LoanAddressesByBorrowerResponse>
  getLoanRequestsMetadata(): Promise<LoanRequestMetadataResponse>
}

declare const EthlendAPI: EthlendAPIInstance;

export default EthlendAPI;
