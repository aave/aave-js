// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
  // import "core-js/fn/array.find"
  // ...
import axios, { AxiosError, AxiosInstance } from 'axios';
import web3 from 'web3';
import {
  BaseResponse,
  LoanRequestTransactionResponse,
  LoanRequestMetadataResponse,
  LoanRequestModel,
  LoanRequestResponse,
  LoanAddressesByBorrowerResponse,
  LoanRequestsAddressesResponse,
} from './types';

export default class EthlendAPI {
  private readonly api: AxiosInstance;

  constructor(
    private readonly web3: web3,
    token: string,
  ) {
    this.api = axios.create({
      baseURL: 'https://our-api-endpoint.com',
      headers: { Authorisation: token },
    });
  }

  private checkAddressChecksum(address: string): void {
    if (!this.web3.utils.checkAddressChecksum(address)) {
      throw `For security reason address ${address} should have correct checksum`;
    }
  }

  private static errorHandler(
    e: AxiosError,
    resourceType: string,
    address: string = ''
  ): BaseResponse {
    const status = e.response ? e.response.status : 504;

    switch (status) {
      case 404:
        return { error: `${resourceType} ${address} doesn't exists`, code: 404 };
      case 401:
        return { error: 'invalid access token', code: 401 };
      case 504:
        return { error: 'probably some troubles with network connection', code: 504 };
      default:
        return { error: 'internal server error, please contact support', code: 500 };
    }
  }

  public async createLoanRequest(
    borrowerAddress: string,
    params: LoanRequestModel,
  ): Promise<LoanRequestTransactionResponse> {
    this.checkAddressChecksum(borrowerAddress);
    try {
      const { data } = await axios.post(`/request/create/${borrowerAddress}`, params);
      return { data, code: 200 };
    } catch (e) {
      return EthlendAPI.errorHandler(e, 'loan request creation', '');
    }
  }

  public async placeLoanRequestCollateral(
    loanAddress: string,
    borrowerAddress: string,
  ): Promise<LoanRequestTransactionResponse> {
    this.checkAddressChecksum(loanAddress);
    this.checkAddressChecksum(borrowerAddress);
    try {
      const { data } = await axios.post(`/request/placecollateral/${loanAddress}/${borrowerAddress}`);
      return { data, code: 200 };
    } catch (e) {
      return EthlendAPI.errorHandler(e, 'placing loan request collateral', loanAddress);
    }
  }

  public async placeLoanRequestPayback(
    loanAddress: string,
    borrowerAddress: string,
  ): Promise<LoanRequestTransactionResponse> {
    this.checkAddressChecksum(loanAddress);
    this.checkAddressChecksum(borrowerAddress);
    try {
      const { data } = await axios.post(`/request/payback/${loanAddress}/${borrowerAddress}`);
      return { data, code: 200 };
    } catch (e) {
      return EthlendAPI.errorHandler(e, 'placing loan request payback', loanAddress);
    }
  }

  public async getLoanRequestData(loanAddress: string): Promise<LoanRequestResponse> {
    this.checkAddressChecksum(loanAddress);
    try {
      const { data } = await this.api.get(`/request/${loanAddress}`);
      return { data: data.loanRequest, code: 200 };
    } catch (e) {
      return EthlendAPI.errorHandler(e, 'loan request', loanAddress);
    }
  }

  public async getAllLoanRequestsAddresses(): Promise<LoanRequestsAddressesResponse> {
    try {
      const { data } = await this.api.get('/requests');
      return { data: data.loanRequest, code: 200 };
    } catch (e) {
      return EthlendAPI.errorHandler(e, 'loan request addresses');
    }
  }

  public async getLoansByBorrower(borrowerAddress: string): Promise<LoanAddressesByBorrowerResponse> {
    this.checkAddressChecksum(borrowerAddress);
    try {
      const { data } = await this.api.get(`/requests/${borrowerAddress}`);
      return { data: data.loanRequest, code: 200 };
    } catch (e) {
      return EthlendAPI.errorHandler(e, 'loan addresses by borrower', borrowerAddress);
    }
  }

  public async getLoanRequestsMetadata(): Promise<LoanRequestMetadataResponse> {
    try {
      const { data } = await this.api.get('/requests/metadata');
      return { data, code: 200 };
    } catch (e) {
      return EthlendAPI.errorHandler(e, 'loan requests metadata');
    }
  }
}
