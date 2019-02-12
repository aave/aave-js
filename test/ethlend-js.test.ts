import EthlendAPI from '../src/ethlend-js'

/**
 * Dummy test
 */
describe('EthlendAPI test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy()
  })

  it('EthlendAPI is instantiable', () => {
    expect(new EthlendAPI({},'token')).toBeInstanceOf(EthlendAPI)
  })
})
