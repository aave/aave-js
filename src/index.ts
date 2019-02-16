// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

import { LoanAPIInstance } from './types'
import LoanRequest from './services/LoanRequest'
import Utils from './services/Utils'

export class Marketplace implements Marketplace {
  public requests: LoanAPIInstance
  public utils: Utils

  constructor(token: string, apiUrl?: string) {
    this.requests = new LoanRequest(token, apiUrl)
    this.utils = new Utils(token, apiUrl)
  }
}
