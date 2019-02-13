import { TransactionObject } from 'web3/eth/types'

export type ResponseCodes = 200 | 401 | 404 | 500 | 504

type Currency = {
  value: string
  description: string
  subChoices?: Currency[]
}

export interface LoanMetadata {
  mediums: Currency[]
  collaterals: Currency[]
  durationRange: { min: number; max: number }
}

export interface BaseLoanModel {
  moe: string
  loanAmount: number
  collateralType: string
  collateralAmount: number
  mpr: number
  duration: number
}

export interface LoanRequestModel extends BaseLoanModel {
  loanAddress?: string
  state?: string
  borrower?: string
  fundedAmount?: number
  outstandingLoanAmount: number
  startTimeoutTime?: number
  isPeggedLoan: boolean
  isCrowdLendingLoan: boolean
  peggedCurrency?: string
  peggedMedium?: string
  type: string
}

export interface BaseResponse {
  data?: any
  error?: string
  code: ResponseCodes
}

export interface LoanTransactionResponse extends BaseResponse {
  data?: TransactionObject<any>
}

export interface LoanRequestResponse extends BaseResponse {
  data?: LoanRequestModel
}

export interface LoanMetadataResponse extends BaseResponse {
  data?: LoanMetadata
}

export interface LoansAddressesResponse extends BaseResponse {
  data?: string[]
}

export interface LoanAddressesByBorrowerResponse extends BaseResponse {
  data?: {
    requestsAsBorrower: string[]
    requestsAsLender: string[]
  }
}

export interface LoanAPIInstance {
  create(creatorWalletAddress: string, params: BaseLoanModel): Promise<LoanTransactionResponse>
  placeCollateral(loanAddress: string, borrowerAddress: string): Promise<LoanTransactionResponse>
  fund(loanAddress: string, lenderAddress: string, amount: number): Promise<LoanTransactionResponse>
  payback(loanAddress: string, borrowerAddress: string): Promise<LoanTransactionResponse>
  getLoanData(loanAddress: string): Promise<LoanRequestResponse>
  getAllAddresses(): Promise<LoansAddressesResponse>
  getLoansByBorrower(borrowerAddress: string): Promise<LoanAddressesByBorrowerResponse>
  getMetadata(): Promise<LoanMetadataResponse>
}

export interface MarketplaceInstance {
  request: LoanAPIInstance
}

declare const Marketplace: MarketplaceInstance

export default Marketplace
