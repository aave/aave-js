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

  public async isCollateralPriceUpdated(loanAddress: string): Promise<boolean> {
    return await this.apiRequest(
      `/request/iscollateralpriceupdated/${loanAddress}`,
      'getting isCollateralPriceUpdated',
      loanAddress
    )
  }

  public async refreshCollateralPrice(loanAddress: string, walletAddress: string): Promise<Transaction> {
    return await this.apiRequest(
      '/request/refreshcollateralprice',
      'refreshCollateralPrice transaction',
      loanAddress,
      'post',
      { loanAddress, caller: walletAddress }
    )
  }

  public async getLoanData(loanAddress: string): Promise<LoanRequestModel> {
    BaseService.checkAddressChecksum(loanAddress)

    return await this.apiRequest(`/request/getone/${loanAddress}`, 'loan requests', loanAddress)
  }

  public async getAllAddresses(): Promise<string[]> {
    return await this.apiRequest('/request', 'loan requests addresses')
  }

  public async getDataAllLoans(): Promise<LoanRequestModel[]> {
    const allRequestAddresses: string[] = await this.getAllAddresses()
    const allDataPromises = allRequestAddresses.map(address => this.getLoanData(address))

    return await Promise.all(allDataPromises)
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

  public async getDataAllLoansByBorrower(borrowerAddress: string): Promise<LoanRequestModel[]> {
    const requestAddressesBorrower = await this.getLoansByBorrower(borrowerAddress)
    const allDataPromises = requestAddressesBorrower.map(address => this.getLoanData(address))

    return await Promise.all(allDataPromises)
  }

  public async getDataAllLoansByLender(lenderAddress: string): Promise<LoanRequestModel[]> {
    const requestAddressesLender = await this.getLoansByBorrower(lenderAddress)
    const allDataPromises = requestAddressesLender.map(address => this.getLoanData(address))

    return await Promise.all(allDataPromises)
  }

  public async getMetadata(): Promise<LoanMetadata> {
    return await this.apiRequest('/request/metadata', 'loan requests metadata')
  }
}
