import {
  LoanTransactionResponse,
  LoanMetadataResponse,
  LoanRequestResponse,
  LoanAddressesByBorrowerResponse,
  LoansAddressesResponse,
  LoanAPIInstance,
  BaseResponse,
  BaseLoanModel
} from '../types'

import BaseService from './BaseService'

export default class LoanRequest extends BaseService implements LoanAPIInstance {
  constructor(token: string, apiUrl?: string) {
    super(token, apiUrl)
  }

  private async apiRequest(
    endpoint: string,
    resourceType: string,
    errorParam: string = '',
    method: 'get' | 'post' = 'get',
    params?: object
  ): Promise<BaseResponse> {
    const api = method === 'post' ? this.api.post : this.api.get

    try {
      const { data } = await api(endpoint, params)

      return { data, code: 200 }
    } catch (e) {
      return LoanRequest.errorHandler(e, resourceType, errorParam)
    }
  }

  public async create(creatorWalletAddress: string, params: BaseLoanModel): Promise<LoanTransactionResponse> {
    BaseService.checkAddressChecksum(creatorWalletAddress)

    return await this.apiRequest(`/request/create/${creatorWalletAddress}`, 'loan request creation', '', 'post', params)
  }

  public async placeCollateral(loanAddress: string, borrowerAddress: string): Promise<LoanTransactionResponse> {
    BaseService.checkAddressChecksum(loanAddress)
    BaseService.checkAddressChecksum(borrowerAddress)

    return await this.apiRequest(
      `/request/placecollateral/${loanAddress}/${borrowerAddress}`,
      'placing loan request collateral',
      loanAddress,
      'post'
    )
  }

  public async fund(loanAddress: string, lenderAddress: string, amount: number): Promise<LoanTransactionResponse> {
    BaseService.checkAddressChecksum(loanAddress)
    BaseService.checkAddressChecksum(lenderAddress)

    return await this.apiRequest(
      `/request/fund/${loanAddress}/${lenderAddress}/${amount}`,
      'funding loan request',
      loanAddress,
      'post'
    )
  }

  public async payback(loanAddress: string, borrowerAddress: string): Promise<LoanTransactionResponse> {
    BaseService.checkAddressChecksum(loanAddress)
    BaseService.checkAddressChecksum(borrowerAddress)

    return await this.apiRequest(
      `/request/payback/${loanAddress}/${borrowerAddress}`,
      'placing loan request payback',
      loanAddress,
      'post'
    )
  }

  public async getLoanData(loanAddress: string): Promise<LoanRequestResponse> {
    BaseService.checkAddressChecksum(loanAddress)

    return await this.apiRequest(`/request/${loanAddress}`, 'loan request', loanAddress)
  }

  public async getAllAddresses(): Promise<LoansAddressesResponse> {
    return await this.apiRequest('/requests', 'loan request addresses')
  }

  public async getLoansByBorrower(borrowerAddress: string): Promise<LoanAddressesByBorrowerResponse> {
    BaseService.checkAddressChecksum(borrowerAddress)

    return await this.apiRequest(`/requests/${borrowerAddress}`, 'loan addresses by borrower', borrowerAddress)
  }

  public async getMetadata(): Promise<LoanMetadataResponse> {
    return await this.apiRequest('/requests/metadata', 'loan requests metadata')
  }
}
