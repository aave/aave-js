import { Transaction } from 'web3/eth/types'

import { LoanOfferAPIInstance, LoanOfferModel, LoanMetadata, BaseLoanModel } from '../types'
import BaseService from './BaseService'

export default class LoanOffer extends BaseService implements LoanOfferAPIInstance {
  constructor(token: string, apiUrl?: string) {
    super(token, apiUrl)
  }

  public async create(lenderAddress: string, params: LoanOfferModel): Promise<Transaction> {
    BaseService.checkAddressChecksum(lenderAddress)

    return await this.apiRequest('/offer', 'loan offer creation', '', 'post', {
      lender: lenderAddress,
      ...params
    })
  }

  public async fund(loanAddress: string, lenderAddress: string): Promise<Transaction> {
    BaseService.checkAddressChecksum(loanAddress)
    BaseService.checkAddressChecksum(lenderAddress)

    return await this.apiRequest(
      `/offer/fund/${loanAddress}/${lenderAddress}`,
      'placing loan offer funds',
      loanAddress,
      'post'
    )
  }

  public async takeLoanOffer(loanAddress: string, params: BaseLoanModel): Promise<Transaction> {
    BaseService.checkAddressChecksum(loanAddress)

    return await this.apiRequest(
      `/offer/take/${loanAddress}`,
      'placing loan offer funds',
      loanAddress,
      'post',
      params
    )
  }

  public async payback(loanAddress: string, borrowerAddress: string): Promise<Transaction> {
    BaseService.checkAddressChecksum(loanAddress)
    BaseService.checkAddressChecksum(borrowerAddress)

    return await this.apiRequest(
      `/offer/payback/${loanAddress}/${borrowerAddress}`,
      'placing offer requests payback',
      loanAddress,
      'post'
    )
  }
  
  public async isCollateralPriceUpdated(loanAddress: string): Promise<boolean> {
    return await this.apiRequest(
      `/offer/iscollateralpriceupdated/${loanAddress}`,
      'check if the collateral price is up to date',
      loanAddress
    )
  }

  public async refreshCollateralPrice(loanAddress: string, walletAddress: string): Promise<Transaction> {
    return await this.apiRequest(
      '/offer/refreshcollateralprice',
      'update collateral price',
      loanAddress,
      'post',
      { loanAddress, caller: walletAddress }
    )
  }

  public async getLoanData(loanAddress: string): Promise<LoanOfferModel> {
    BaseService.checkAddressChecksum(loanAddress)

    return await this.apiRequest(`/offer/getone/${loanAddress}`, 'loan offers', loanAddress)
  }

  public async getAllAddresses(): Promise<string[]> {
    return await this.apiRequest('/offer', 'loan offer addresses')
  }

  public async getDataAllLoans(): Promise<LoanOfferModel[]> {
    const allOfferAddresses: string[] = await this.getAllAddresses()
    const allDataPromises = allOfferAddresses.map(address => this.getLoanData(address))

    return await Promise.all(allDataPromises)
  }

  public async getLoansByBorrower(borrowerAddress: string): Promise<string[]> {
    BaseService.checkAddressChecksum(borrowerAddress)

    return await this.apiRequest(
      `/offer/getlistbyborrower/${borrowerAddress}`,
      'loan offer addresses by borrower',
      borrowerAddress
    )
  }

  public async getLoansByLender(lenderAddress: string): Promise<string[]> {
    BaseService.checkAddressChecksum(lenderAddress)

    return await this.apiRequest(`/offer/getlistbylender/${lenderAddress}`, 'loan offer addresses by lender', lenderAddress)
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

  public async getMetadata(): Promise<LoanMetadata> {
    return await this.apiRequest('/offer/metadata', 'loan offers metadata')
  }

  public async partialCallDefault(loanAddress: string, lender: string): Promise<Transaction> {
    BaseService.checkAddressChecksum(loanAddress)
    BaseService.checkAddressChecksum(lender)

    return await this.apiRequest(
      `/request/calldefault/${loanAddress}/${lender}`,
      'Default call on loan',
      loanAddress,
      'post'
    )
  }

  public async callCollateral(loanAddress: string, lender: string): Promise<Transaction> {
    BaseService.checkAddressChecksum(loanAddress)
    BaseService.checkAddressChecksum(lender)

    return await this.apiRequest(
      `/request/callcollateral/${loanAddress}/${lender}`,
      'Default call on loan',
      loanAddress,
      'post'
    )
  }

  public async withdrawPartialDefaultAmount(loanAddress: string, lender: string): Promise<Transaction> {
    BaseService.checkAddressChecksum(loanAddress)
    BaseService.checkAddressChecksum(lender)

    return await this.apiRequest(
      `/request/withdrawpartialdefaultamount/${loanAddress}/${lender}`,
      'Withdraw defaulted amount on loan',
      loanAddress,
      'post'
    )
  }

}
