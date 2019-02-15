import { Transaction } from 'web3/eth/types'

export type ResponseCodes = 200 | 400 | 401 | 404 | 500 | 504

type Currency = {
  value: string
  description: string
  subChoices?: Currency[]
}

export interface ServiceErrorInstance extends Error {
  code: ResponseCodes
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
  nextInstalmentAmount?: number
  type: string
}

export interface LoanAPIInstance {
  create(creatorWalletAddress: string, params: BaseLoanModel): Promise<Transaction>
  placeCollateral(loanAddress: string, borrowerAddress: string): Promise<Transaction>
  fund(loanAddress: string, lenderAddress: string, amount: number): Promise<Transaction>
  payback(loanAddress: string, borrowerAddress: string): Promise<Transaction>
  getMaxLoanAmountFromCollateral(collateralAmount: number, collateralType: string, moe: string): Promise<number>
  isCollateralPriceUpdated(loanAddress: string): Promise<boolean>
  refreshCollateralPrice(loanAddress: string, walletAddress: string): Promise<Transaction>
  getLoanData(loanAddress: string): Promise<LoanRequestModel>
  getAllAddresses(): Promise<string[]>
  getLoansByBorrower(borrowerAddress: string): Promise<string[]>
  getLoansByLender(lenderAddress: string): Promise<string[]>
  getMetadata(): Promise<LoanMetadata>
}

export interface UtilsInstance {
  approveTransfer(address: string, tokenSymbol: string): Promise<Transaction>
  isTransferApproved(address: string, tokenSymbol: string, amount: number): Promise<boolean>
  signup(email: string, name: string, password: string, organisation?: string): Promise<string>
  renewToken(email: string, password: string): Promise<string>
}

export interface MarketplaceInstance {
  request: LoanAPIInstance
}

declare const Marketplace: MarketplaceInstance

export default Marketplace
