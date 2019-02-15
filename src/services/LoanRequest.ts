import { Transaction } from 'web3/eth/types'

import { LoanAPIInstance, BaseLoanModel, LoanRequestModel, LoanMetadata } from '../types'
import BaseService from './BaseService'

export default class LoanRequest extends BaseService implements LoanAPIInstance {
  constructor(token: string, apiUrl?: string) {
    super(token, apiUrl)
  }

  public async create(borrowerWalletAddress: string, params: BaseLoanModel): Promise<Transaction> {
    BaseService.checkAddressChecksum(borrowerWalletAddress)

    return await this.apiRequest('/request', 'loan requests creation', '', 'post', {
      borrower: borrowerWalletAddress,
      ...params
    })
  }

  public async placeCollateral(loanAddress: string, borrowerAddress: string): Promise<Transaction> {
    BaseService.checkAddressChecksum(loanAddress)
    BaseService.checkAddressChecksum(borrowerAddress)

    return await this.apiRequest(
      `/request/placecollateral/${loanAddress}/${borrowerAddress}`,
      'placing loan requests collateral',
      loanAddress,
      'post'
    )
  }

  public async fund(loanAddress: string, lenderAddress: string, amount: number): Promise<Transaction> {
    BaseService.checkAddressChecksum(loanAddress)
    BaseService.checkAddressChecksum(lenderAddress)

    return await this.apiRequest(
      `/request/fund/${loanAddress}/${lenderAddress}/${amount}`,
      'funding loan requests',
      loanAddress,
      'post'
    )
  }

  public async payback(loanAddress: string, borrowerAddress: string): Promise<Transaction> {
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
    moe: string
  ): Promise<number> {
    return await this.apiRequest('/request/maxamount/', 'getting max loan amount', collateralType, 'post', {
      collateralAmount,
      collateralType,
      moe
    })
  }

  public async getLoanData(loanAddress: string): Promise<LoanRequestModel> {
    BaseService.checkAddressChecksum(loanAddress)

    return await this.apiRequest(`/request/getone/${loanAddress}`, 'loan requests', loanAddress)
  }

  public async getAllAddresses(): Promise<string[]> {
    return await this.apiRequest('/request', 'loan requests addresses')
  }

  public async getDataAllLoans(): Promise<LoanRequestModel[]> {
      const allRequestAddresses : string[] = await this.getAllAddresses();  
      const allDataPromises = allRequestAddresses.map(address => this.getLoanData(address))

      return await Promise.all(allDataPromises);
  }

  public async getLoansByBorrower(borrowerAddress: string): Promise<string[]> {
    BaseService.checkAddressChecksum(borrowerAddress)

    return await this.apiRequest(
      `/request/getlistbyborrower/${borrowerAddress}`,
      'loan addresses by borrower',
      borrowerAddress
    )
  }

  public async getLoansByLender(lenderAddress: string): Promise<string[]> {
    BaseService.checkAddressChecksum(lenderAddress)

    return await this.apiRequest(`/request/getlistbylender/${lenderAddress}`, 'loan addresses by lender', lenderAddress)
  }

  public async getMetadata(): Promise<LoanMetadata> {
    return await this.apiRequest('/request/metadata', 'loan requests metadata')
  }
}
