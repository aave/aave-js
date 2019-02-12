import LoanRequest from '../src/ethlend-js'

/**
 * Dummy test
 */
describe('LoanRequest test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy()
  })

  it('LoanRequest is instantiable', () => {
    expect(new LoanRequest({}, 'token')).toBeInstanceOf(LoanRequest)
  })
})
