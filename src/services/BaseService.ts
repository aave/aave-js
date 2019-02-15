import axios, { AxiosError, AxiosInstance } from 'axios'
import { isValidChecksumAddress } from 'ethereumjs-util'
import { ResponseCodes, ServiceErrorInstance } from '../types'

class ServiceError extends Error implements ServiceErrorInstance {
  public code: ResponseCodes
  constructor(message: string, code: ResponseCodes) {
    super(message)
    this.code = code
  }
}

export default class BaseService {
  protected readonly api: AxiosInstance

  constructor(token: string, apiUrl?: string) {
    this.api = axios.create({
      baseURL: apiUrl || 'https://ethdenver-api.aave.com/',
      headers: { Authorization: `Bearer ${token}` }
    })
  }

  protected static checkAddressChecksum(address: string): void {
    if (!isValidChecksumAddress(address)) {
      throw `For security reason address ${address} should have correct checksum`
    }
  }

  protected static errorHandler(e: AxiosError, resourceType: string, address: string = ''): ServiceError {
    const status = e.response ? e.response.status : 504

    switch (status) {
      case 400: {
        const errorText = e.response && e.response.data && e.response.data.error ? e.response.data.error : ''
        return new ServiceError(`bad request: ${errorText}`, 400)
      }
      case 401:
        return new ServiceError('invalid access token', 401)
      case 404:
        return new ServiceError(`${resourceType} ${address} doesn't exists`, 404)
      case 504:
        return new ServiceError('probably some troubles with network connection', 504)
      default:
        return new ServiceError('internal server error, please contact support', 500)
    }
  }

  protected async apiRequest(
    endpoint: string,
    resourceType: string,
    errorParam: string = '',
    method: 'get' | 'post' = 'get',
    params?: object
  ): Promise<any> {
    const api = method === 'post' ? this.api.post : this.api.get

    try {
      const { data } = await api(endpoint, params)
      return data
    } catch (e) {
      throw BaseService.errorHandler(e, resourceType, errorParam)
    }
  }
}
