import { Transaction } from 'web3/eth/types'

import BaseService from './BaseService'

export default class Utils extends BaseService {
  constructor(token: string, apiUrl?: string) {
    super(token, apiUrl)
  }
  public async approveTransfer(address: string, tokenSymbol: string): Promise<Transaction> {
    return await this.apiRequest('/common/approvetransfer/', 'token approval', tokenSymbol, 'post', {
      address,
      token: tokenSymbol
    })
  }

  public async isTransferApproved(address: string, tokenSymbol: string, amount: number): Promise<boolean> {
    return await this.apiRequest(
      `/common/istransferapproved/${address}/${tokenSymbol}/${amount}`,
      'is token transfer approved'
    )
  }

  public async signup(email: string, name: string, password: string, organisation?: string): Promise<string> {
    return await this.apiRequest('/auth/signup', 'signup', '', 'post', { email, name, password, organisation })
  }

  public async renewToken(email: string, password: string): Promise<string> {
    return await this.apiRequest('/auth/renewtoken', 'token renewal', '', 'post', { email, password })
  }
}
