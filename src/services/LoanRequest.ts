import { Transaction } from 'web3/eth/types'

import { LoanRequestAPIInstance, LoanRequestModel } from '../types'
import BaseService from './BaseService'
import BaseLoanService from './BaseLoanService'

export default class LoanRequest extends BaseLoanService implements LoanRequestAPIInstance {
  constructor(token: string, apiUrl?: string) {
    super('/request', token, apiUrl)
  }

  public async create(borrowerWalletAddress: string, params: LoanRequestModel): Promise<Transaction> {
    BaseService.checkAddressChecksum(borrowerWalletAddress)

    return await this.apiRequest('', 'loan requests creation', '', 'post', {
      borrower: borrowerWalletAddress,
      ...params
    })
  }

  public async placeCollateral(loanAddress: string, borrowerAddress: string): Promise<Transaction> {
    BaseService.checkAddressChecksum(loanAddress)
    BaseService.checkAddressChecksum(borrowerAddress)

    return await this.apiRequest(
      `/placecollateral/${loanAddress}/${borrowerAddress}`,
      'placing loan requests collateral',
      loanAddress,
      'post'
    )
  }

  public async fund(loanAddress: string, lenderAddress: string, amount: number): Promise<Transaction> {
    BaseService.checkAddressChecksum(loanAddress)
    BaseService.checkAddressChecksum(lenderAddress)

    return await this.apiRequest(
      `/fund/${loanAddress}/${lenderAddress}/${amount}`,
      'funding loan requests',
      loanAddress,
      'post'
    )
  }

  public async getLoanData(loanAddress: string): Promise<LoanRequestModel> {
    BaseService.checkAddressChecksum(loanAddress)

    return await this.apiRequest(`/getone/${loanAddress}`, 'loan requests', loanAddress)
  }

  public async getAllAddresses(): Promise<string[]> {
    return await this.apiRequest('', 'loan requests addresses')
  }

  public async getDataAllLoans(): Promise<LoanRequestModel[]> {
    const allRequestAddresses: string[] = await this.getAllAddresses()
    const allDataPromises = allRequestAddresses.map(address => this.getLoanData(address))

    return await Promise.all(allDataPromises)
  }

  public async getDataAllLoansByBorrower(borrowerAddress: string): Promise<LoanRequestModel[]> {
    const requestAddressesBorrower = await this.getLoansByBorrower(borrowerAddress)
    const allDataPromises = requestAddressesBorrower.map(address => this.getLoanData(address))

    return await Promise.all(allDataPromises)
  }

  public async getDataAllLoansByLender(lenderAddress: string): Promise<LoanRequestModel[]> {
    const requestAddressesLender = await this.getLoansByLender(lenderAddress)
    const allDataPromises = requestAddressesLender.map(address => this.getLoanData(address))

    return await Promise.all(allDataPromises)
  }
}
