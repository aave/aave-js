// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

import { LoanRequestAPIInstance, LoanOfferAPIInstance } from './types'
import LoanRequest from './services/LoanRequest'
import Utils from './services/Utils'
import LoanOffer from './services/LoanOffer';

export class Marketplace implements Marketplace {
  public requests: LoanRequestAPIInstance
  public offers: LoanOfferAPIInstance
  public utils: Utils

  constructor(token: string, apiUrl?: string) {
    this.requests = new LoanRequest(token, apiUrl)
    this.offers = new LoanOffer(token,apiUrl)
    this.utils = new Utils(token, apiUrl)
  }
}
