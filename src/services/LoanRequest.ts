// tslint:disable-next-line
import Web3 from 'web3'

import {
  LoanTransactionResponse,
  LoanMetadataResponse,
  LoanRequestResponse,
  LoanAddressesByBorrowerResponse,
  LoansAddressesResponse,
  LoanAPIInstance,
  BaseLoanModel,
  MaxLoanAmountResponse
} from '../types'
import BaseService from './BaseService'

export default class LoanRequest extends BaseService implements LoanAPIInstance {
  constructor(token: string, web3?: Web3, apiUrl?: string) {
    super(token, web3, apiUrl)
  }

  public async create(borrowerWalletAddress: string, params: BaseLoanModel): Promise<LoanTransactionResponse> {
    BaseService.checkAddressChecksum(borrowerWalletAddress)

    return await this.apiRequest('/request', 'loan requests creation', '', 'post', {
      borrower: borrowerWalletAddress,
      ...params
    })
  }

  public async placeCollateral(loanAddress: string, borrowerAddress: string): Promise<LoanTransactionResponse> {
    BaseService.checkAddressChecksum(loanAddress)
    BaseService.checkAddressChecksum(borrowerAddress)

    return await this.apiRequest(
      `/request/placecollateral/${loanAddress}/${borrowerAddress}`,
      'placing loan requests collateral',
      loanAddress,
      'post'
    )
  }

  public async fund(loanAddress: string, lenderAddress: string, amount: number): Promise<LoanTransactionResponse> {
    BaseService.checkAddressChecksum(loanAddress)
    BaseService.checkAddressChecksum(lenderAddress)

    return await this.apiRequest(
      `/request/fund/${loanAddress}/${lenderAddress}/${amount}`,
      'funding loan requests',
      loanAddress,
      'post'
    )
  }

  public async payback(loanAddress: string, borrowerAddress: string): Promise<LoanTransactionResponse> {
    BaseService.checkAddressChecksum(loanAddress)
    BaseService.checkAddressChecksum(borrowerAddress)

    return await this.apiRequest(
      `/request/payback/${loanAddress}/${borrowerAddress}`,
      'placing loan requests payback',
      loanAddress,
      'post'
    )
  }
  public async getMaxLoanAmountFromCollateral(
    collateralAmount: number,
    collateralType: string,
    moe: string,
    ltv?: number
  ): Promise<MaxLoanAmountResponse> {
    return await this.apiRequest('/request/maxamount/', 'getting max loan amount', collateralType, 'post', {
      collateralAmount,
      collateralType,
      moe,
      ltv
    })
  }

  public async getLoanData(loanAddress: string): Promise<LoanRequestResponse> {
    BaseService.checkAddressChecksum(loanAddress)

    return await this.apiRequest(`/request/getone/${loanAddress}`, 'loan requests', loanAddress)
  }

  public async getAllAddresses(): Promise<LoansAddressesResponse> {
    return await this.apiRequest('/request', 'loan requests addresses')
  }

  public async getLoansByBorrower(borrowerAddress: string): Promise<LoanAddressesByBorrowerResponse> {
    BaseService.checkAddressChecksum(borrowerAddress)

    return await this.apiRequest(
      `/request/getlistbyborrower/${borrowerAddress}`,
      'loan addresses by borrower',
      borrowerAddress
    )
  }

  public async getMetadata(): Promise<LoanMetadataResponse> {
    return await this.apiRequest('/request/metadata', 'loan requests metadata')
  }
}
