// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
import { LoanAPIInstance } from './types'
import LoanRequest from './LoanRequest'

export class Marketplace {
  public request: LoanAPIInstance

  constructor(token: string) {
    this.request = new LoanRequest(token)
  }
}
