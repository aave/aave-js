import LoanRequest from '../src/services/LoanRequest'
import { LoanRequestModel } from '../src/types'
/**
 * LoanRequest test
 */
describe('LoanRequest test', () => {
  const request = new LoanRequest('a94be1bc8e770454d8c7e7a23f2d205ecd6003c341d7a28e88', 'https://apikovan.aave.com/')

  it('LoanRequest is instantiable', () => {
    expect(request).toBeInstanceOf(LoanRequest)
  })

  it('Should load all addresses from api', async () => {
    const data = await request.getAllAddresses()
    expect(data).toBeTruthy()
  })

  it('Should load requests metadata from api', async () => {
    const data = await request.getMetadata()
    expect(data).toBeTruthy()
  })

  it('Should get single loan data from api', async () => {
    const data = await request.getLoanData('0x43faA0DB2891e4e793D976917991411eC77Ac481')
    expect(data).toBeTruthy()
  })

  it('Should check isCollateralPriceUpdated via api', async () => {
    const data = await request.isCollateralPriceUpdated('0x43faA0DB2891e4e793D976917991411eC77Ac481')
    expect(data).toBeTruthy()
  })

  it('Should get refreshCollateralPrice transaction via api', async () => {
    const data = await request.refreshCollateralPrice(
      '0x71f4CF5Cfb74a9D3c9060aC4c25070F989cFC39C',
      '0x4206925f7652a5af8a0F48aB714ABbd1EF27D916'
    )
    expect(data).toBeTruthy()
  })

  it('Should get all loans by borrower data from api', async () => {
    const data = await request.getLoansByBorrower('0x4206925f7652a5af8a0F48aB714ABbd1EF27D916')
    expect(data).toBeTruthy()
  })

  it('Should get all loans by lender data from api', async () => {
    const data = await request.getLoansByLender('0x4206925f7652a5af8a0F48aB714ABbd1EF27D916')
    expect(data).toBeTruthy()
  })

  it('Should get all loans data from api', async () => {
    const data = await request.getDataAllLoans()
    expect(data).toBeTruthy()
  })

  it('Should get loan creation transaction from api', async () => {
    const loanData: LoanRequestModel = {
      loanAmount: 0.0416,
      moe: 'ETH',
      collateralAmount: 1000,
      collateralType: 'LEND',
      mpr: 2,
      duration: 7,
      isPeggedLoan: false,
      type: 'REQUEST',
      isCrowdLendingLoan: false,
      outstandingLoanAmount: 0
    }

    const data = await request.create('0x4206925f7652a5af8a0F48aB714ABbd1EF27D916', loanData)
    expect(data).toBeTruthy()
  })

  it('Should get placeCollateral transaction from api', async () => {
    const data = await request.placeCollateral(
      '0xb83AE5BE607fCA481dCB3a95843c7423A111f655',
      '0x4206925f7652a5af8a0F48aB714ABbd1EF27D916'
    )
    expect(data).toBeTruthy()
  })

  it('Should get fund transaction from api', async () => {
    const data = await request.fund(
      '0x71f4CF5Cfb74a9D3c9060aC4c25070F989cFC39C',
      '0x4206925f7652a5af8a0F48aB714ABbd1EF27D916',
      0.05
    )
    expect(data).toBeTruthy()
  })
})
