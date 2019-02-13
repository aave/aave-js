import axios, { AxiosError, AxiosInstance } from 'axios'
import { isValidChecksumAddress } from 'ethereumjs-util'

import { BaseResponse } from '../types'

export default class BaseService {
  protected readonly api: AxiosInstance

  constructor(token: string, apiUrl?: string) {
    this.api = axios.create({
      baseURL: apiUrl || 'https://api.aave.com',
      headers: { Authorization: `Bearer ${token}` }
    })
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
}
