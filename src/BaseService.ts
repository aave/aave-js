import axios, { AxiosError, AxiosInstance } from 'axios'
import keccak from 'keccak'

import { BaseResponse } from './types'

export default class BaseService {
  protected readonly api: AxiosInstance

  constructor(token: string) {
    this.api = axios.create({
      baseURL: 'https://our-api-endpoint.com',
      headers: { Authorisation: token }
    })
  }

  protected static checkAddressChecksum(address: string): void {
    const tempAddress = address.toLowerCase().replace('0x', '')
    const hash = keccak('keccak256')
      .update(address)
      .digest('hex')
    let checksummedAddress = '0x'

    for (let i = 0; i < tempAddress.length; i += 1) {
      if (parseInt(String(hash[i]), 16) >= 8) {
        checksummedAddress += tempAddress[i].toUpperCase()
      } else {
        checksummedAddress += tempAddress[i]
      }
    }

    if (address !== checksummedAddress) {
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
