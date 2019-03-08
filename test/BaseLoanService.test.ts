import BaseLoanService from '../src/services/BaseLoanService'
import { LoanOfferModel } from '../src/types'

/**
 * BaseLoanService test
 */
describe('BaseLoanService test', () => {
  const service = new BaseLoanService(
    '/request', // using request as test base
    'a94be1bc8e770454d8c7e7a23f2d205ecd6003c341d7a28e88'
  )

  it('BaseLoanService is instantiable', () => {
    expect(service).toBeInstanceOf(BaseLoanService)
  })

  it('Should get payback transaction from api', async () => {
    const data = await service.payback(
      '0xb83AE5BE607fCA481dCB3a95843c7423A111f655',
      '0x4206925f7652a5af8a0F48aB714ABbd1EF27D916'
    )
    expect(data).toBeTruthy()
  })

  it('Executes partial call default', async () => {
    const data = await service.partialCallDefault(
      '0xb83AE5BE607fCA481dCB3a95843c7423A111f655',
      '0x4206925f7652a5af8a0F48aB714ABbd1EF27D916'
    )

    expect(data).toBeTruthy()
  })

  it('Executes collateral call', async () => {
    const data = await service.callCollateral(
      '0xb83AE5BE607fCA481dCB3a95843c7423A111f655',
      '0x4206925f7652a5af8a0F48aB714ABbd1EF27D916'
    )

    expect(data).toBeTruthy()
  })
})
