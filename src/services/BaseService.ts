import axios, { AxiosError, AxiosInstance } from 'axios'
import { isValidChecksumAddress } from 'ethereumjs-util'
// tslint:disable-next-line
import Web3 from 'web3'

import { BaseResponse } from '../types'
import { Transaction } from 'web3/eth/types'
import { TransactionReceipt } from 'web3-core/types'

export default class BaseService {
  protected readonly api: AxiosInstance
  protected readonly web3?: Web3

  constructor(token: string, web3?: Web3, apiUrl?: string) {
    this.api = axios.create({
      baseURL: apiUrl || 'https://api.aave.com',
      headers: { Authorization: `Bearer ${token}` }
    })
    this.web3 = web3
  }

  protected static checkAddressChecksum(address: string): void {
    if (!isValidChecksumAddress(address)) {
      throw `For security reason address ${address} should have correct checksum`
    }
  }

  protected static errorHandler(e: AxiosError, resourceType: string, address: string = ''): BaseResponse {
    const status = e.response ? e.response.status : 504

    switch (status) {
      case 404:
        return { error: `${resourceType} ${address} doesn't exists`, code: 404 }
      case 401:
        return { error: 'invalid access token', code: 401 }
      case 504:
        return { error: 'probably some troubles with network connection', code: 504 }
      default:
        return { error: 'internal server error, please contact support', code: 500 }
    }
  }

  protected async apiRequest(
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
      return BaseService.errorHandler(e, resourceType, errorParam)
    }
  }

  private async sendTransaction(tx: Transaction): Promise<TransactionReceipt> {
    if (this.web3) {
      const currentNetwork = await this.web3.eth.net.getNetworkType()
      if (currentNetwork === 'kovan') {
        return await this.web3.eth.sendTransaction(tx)
      }
      throw `this version of API allows transactions only on kovan network, but ${currentNetwork} chosen`
    }
    throw 'web3 provider is not specified'
  }
}
