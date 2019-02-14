// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
// tslint:disable-next-line
import Web3 from 'web3'

import { LoanAPIInstance } from './types'
import LoanRequest from './services/LoanRequest'

export class Marketplace implements Marketplace {
  public requests: LoanAPIInstance

  constructor(token: string, web3?: Web3, apiUrl?: string) {
    this.requests = new LoanRequest(token, web3, apiUrl)
  }
}
