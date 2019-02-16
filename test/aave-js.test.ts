import { Marketplace } from '../src/index'

/**
 * Marketplace test
 */
describe('Marketplace test', () => {
  it('Marketplace is instantiable', () => {
    expect(new Marketplace('token', undefined)).toBeInstanceOf(Marketplace)
  })
})
