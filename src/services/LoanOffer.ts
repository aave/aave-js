import { Transaction } from 'web3/eth/types'

import { LoanOfferAPIInstance, LoanOfferModel } from '../types'
import BaseService from './BaseService'
import BaseLoanService from './BaseLoanService'

export default class LoanOffer extends BaseLoanService implements LoanOfferAPIInstance {
  constructor(token: string, apiUrl?: string) {
    super('/offer', token, apiUrl)
  }

  public async create(lenderAddress: string, params: LoanOfferModel): Promise<Transaction> {
    BaseService.checkAddressChecksum(lenderAddress)

    return await this.apiRequest('', 'loan offer creation', '', 'post', {
      lender: lenderAddress,
      ...params
    })
  }

  public async fund(loanAddress: string, lenderAddress: string): Promise<Transaction> {
    BaseService.checkAddressChecksum(loanAddress)
    BaseService.checkAddressChecksum(lenderAddress)

    return await this.apiRequest(
      `/fund/${loanAddress}/${lenderAddress}`,
      'placing loan offer funds',
      loanAddress,
      'post'
    )
  }

  public async takeLoanOffer(loanAddress: string, params: LoanOfferModel): Promise<Transaction> {
    BaseService.checkAddressChecksum(loanAddress)

    return await this.apiRequest(`/take/${loanAddress}`, 'placing loan offer funds', loanAddress, 'post', params)
  }

  public async getLoanData(loanAddress: string): Promise<LoanOfferModel> {
    BaseService.checkAddressChecksum(loanAddress)

    return await this.apiRequest(`/getone/${loanAddress}`, 'loan offers', loanAddress)
  }

  public async getDataAllLoans(): Promise<LoanOfferModel[]> {
    const allOfferAddresses: string[] = await this.getAllAddresses()
    const allDataPromises = allOfferAddresses.map(address => this.getLoanData(address))

    return await Promise.all(allDataPromises)
  }
  public async getDataAllLoansByBorrower(borrowerAddress: string): Promise<LoanOfferModel[]> {
    const offerAddressesBorrower = await this.getLoansByBorrower(borrowerAddress)
    const allDataPromises = offerAddressesBorrower.map(address => this.getLoanData(address))

    return await Promise.all(allDataPromises)
  }

  public async getDataAllLoansByLender(lenderAddress: string): Promise<LoanOfferModel[]> {
    const offerAddressesLender = await this.getLoansByLender(lenderAddress)
    const allDataPromises = offerAddressesLender.map(address => this.getLoanData(address))

    return await Promise.all(allDataPromises)
  }
}
