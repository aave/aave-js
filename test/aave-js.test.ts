import { Marketplace } from '../src/aave-js'

/**
 * Dummy test
 */
describe('Marketplace test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy()
  })

  it('LoanRequest is instantiable', () => {
    expect(new Marketplace('token')).toBeInstanceOf(Marketplace)
  })
})
