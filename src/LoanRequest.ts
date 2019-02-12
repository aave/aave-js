import {
  LoanTransactionResponse,
  LoanMetadataResponse,
  LoanRequestModel,
  LoanRequestResponse,
  LoanAddressesByBorrowerResponse,
  LoansAddressesResponse,
  LoanAPIInstance
} from './types'

import BaseService from './BaseService'

export default class LoanRequest extends BaseService implements LoanAPIInstance {
  constructor(token: string) {
    super(token)
  }

  public async create(creatorWalletAddress: string, params: LoanRequestModel): Promise<LoanTransactionResponse> {
    BaseService.checkAddressChecksum(creatorWalletAddress)
    try {
      const { data } = await this.api.post(`/request/create/${creatorWalletAddress}`, params)
      return { data, code: 200 }
    } catch (e) {
      return LoanRequest.errorHandler(e, 'loan request creation')
    }
  }

  public async placeCollateral(loanAddress: string, borrowerAddress: string): Promise<LoanTransactionResponse> {
    BaseService.checkAddressChecksum(loanAddress)
    BaseService.checkAddressChecksum(borrowerAddress)
    try {
      const { data } = await this.api.post(`/request/placecollateral/${loanAddress}/${borrowerAddress}`)
      return { data, code: 200 }
    } catch (e) {
      return LoanRequest.errorHandler(e, 'placing loan request collateral', loanAddress)
    }
  }

  public async payback(loanAddress: string, borrowerAddress: string): Promise<LoanTransactionResponse> {
    BaseService.checkAddressChecksum(loanAddress)
    BaseService.checkAddressChecksum(borrowerAddress)
    try {
      const { data } = await this.api.post(`/request/payback/${loanAddress}/${borrowerAddress}`)
      return { data, code: 200 }
    } catch (e) {
      return LoanRequest.errorHandler(e, 'placing loan request payback', loanAddress)
    }
  }

  public async getLoanData(loanAddress: string): Promise<LoanRequestResponse> {
    BaseService.checkAddressChecksum(loanAddress)
    try {
      const { data } = await this.api.get(`/request/${loanAddress}`)
      return { data: data.loanRequest, code: 200 }
    } catch (e) {
      return LoanRequest.errorHandler(e, 'loan request', loanAddress)
    }
  }

  public async getAllAddresses(): Promise<LoansAddressesResponse> {
    try {
      const { data } = await this.api.get('/requests')
      return { data: data.loanRequest, code: 200 }
    } catch (e) {
      return LoanRequest.errorHandler(e, 'loan request addresses')
    }
  }

  public async getLoansByBorrower(borrowerAddress: string): Promise<LoanAddressesByBorrowerResponse> {
    BaseService.checkAddressChecksum(borrowerAddress)
    try {
      const { data } = await this.api.get(`/requests/${borrowerAddress}`)
      return { data: data.loanRequest, code: 200 }
    } catch (e) {
      return LoanRequest.errorHandler(e, 'loan addresses by borrower', borrowerAddress)
    }
  }

  public async getMetadata(): Promise<LoanMetadataResponse> {
    try {
      const { data } = await this.api.get('/requests/metadata')
      return { data, code: 200 }
    } catch (e) {
      return LoanRequest.errorHandler(e, 'loan requests metadata')
    }
  }
}
