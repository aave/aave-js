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
  loanAddress?: string
  state?: string
  borrower?: string
  fundedAmount?: number
  outstandingLoanAmount: number
  startTimeoutTime?: number
  nextInstalmentAmount?: number
  type: string
 }

export interface LoanRequestModel extends BaseLoanModel {
  isPeggedLoan: boolean
  isCrowdLendingLoan: boolean
  peggedCurrency?: string
  peggedMedium?: string
}

export interface LoanOfferModel extends BaseLoanModel {
  minimumLoanAmount: number | null;
  maximumLoanAmount: number;
  durationRange: LoanOfferDuration;
  collaterals: LoanOfferCollateral[];
}

export interface LoanOfferCollateral {
  id: number;
  symbol: string;
  ltv: number;
  mpr: number;
  valid: boolean;
}
export interface LoanOfferDuration {
  min: number;
  max: number;
}
export interface LoanAPIInstanceBase {
  create(creatorWalletAddress: string, params: BaseLoanModel): Promise<Transaction>
  fund(loanAddress: string, lenderAddress: string, amount: number): Promise<Transaction>
  payback(loanAddress: string, borrowerAddress: string): Promise<Transaction>
  isCollateralPriceUpdated(loanAddress: string): Promise<boolean>
  refreshCollateralPrice(loanAddress: string, walletAddress: string): Promise<Transaction>
  getAllAddresses(): Promise<string[]>
  getLoansByBorrower(borrowerAddress: string): Promise<string[]>
  getLoansByLender(lenderAddress: string): Promise<string[]>
  getMetadata(): Promise<LoanMetadata>
  callCollateral(loanAddress: string, lender: string) : Promise<Transaction>
  partialCallDefault(loanAddress: string, lender: string) : Promise<Transaction>
  withdrawPartialDefaultAmount(loanAddress: string, lender: string) : Promise<Transaction>
}

export interface LoanRequestAPIInstance extends LoanAPIInstanceBase{
  getLoanData(loanAddress: string): Promise<LoanRequestModel>
  placeCollateral(loanAddress: string, borrowerAddress: string): Promise<Transaction>
}

export interface LoanOfferAPIInstance extends LoanAPIInstanceBase{
  getLoanData(loanAddress: string): Promise<LoanOfferModel>
  takeLoanOffer(loanAddress: string, params: BaseLoanModel) : Promise<Transaction>
}



export interface UtilsInstance {
  getMaxLoanAmountFromCollateral( collateralAmount: number,collateralType: string,moe: string): Promise<number>
  approveTransfer(address: string, tokenSymbol: string): Promise<Transaction>
  isTransferApproved(address: string, tokenSymbol: string, amount: number): Promise<boolean>
  signup(email: string, name: string, password: string, organisation?: string): Promise<string>
  renewToken(email: string, password: string): Promise<string>
}

export interface MarketplaceInstance {
  request: LoanRequestAPIInstance
}

declare const Marketplace: MarketplaceInstance

export default Marketplace
