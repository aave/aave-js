import BaseService from '../src/services/BaseService'
/**
 * BaseService test
 */
describe('BaseService tests', () => {
  const defaultService = new BaseService('075be6041815e845c921edbbc6201fc4bc2d5f42312fa97a86')

  it('BaseService is instantiable', () => {
    expect(defaultService).toBeInstanceOf(BaseService)
  })

  describe('checkAddressChecksum method', () => {
    it('should check valid eth addresses without errors', () => {
      expect(BaseService['checkAddressChecksum']('0x71f4CF5Cfb74a9D3c9060aC4c25070F989cFC39C')).toBeUndefined()
    })

    it('should throw error on checking invalid eth address', () => {
      expect(() => BaseService['checkAddressChecksum']('0x71f4CF5Cfb74a9D3c9060aC4c25070F989cFC39c')).toThrow()
    })
  })

  describe('errorHandler method', () => {
    const axiosErrorMock = (status: number) => ({
      message: '',
      name: '',
      config: {},
      response: { status, data: null, headers: null, statusText: '', config: {} }
    })
    it('should return correct error codes', () => {
      for (const status of [400, 401, 404, 500, 504]) {
        expect(BaseService['errorHandler'](axiosErrorMock(status), 'type').code).toBe(status)
      }
    })

    it('should return 500 code on unknown status', () => {
      expect(BaseService['errorHandler'](axiosErrorMock(343), 'type').code).toBe(500)
    })

    it('should return 504 code if no response', () => {
      expect(BaseService['errorHandler']({ message: '', name: '', config: {}, response: undefined }, 'type').code).toBe(
        504
      )
    })
  })

  it('apiRequest should throw error', async () => {
    try {
      await defaultService['apiRequest']('/adoasd', 'some')
    } catch (e) {
      expect(e).toBeTruthy()
    }
  })
})
