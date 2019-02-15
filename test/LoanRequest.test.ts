import LoanRequest from '../src/services/LoanRequest'
/**
 * LoanRequest test
 */
describe('LoanRequest test', () => {
  const request = new LoanRequest('86C019FF04C4', 'http://localhost:3333')

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

  it('Should load requests getMaxLoanAmountFromCollateral from api', async () => {
    const data = await request.getMaxLoanAmountFromCollateral(2312, 'LEND', 'ETH')
    expect(data).toBeTruthy()
  })

  it('Should get single loan data from api', async () => {
    const data = await request.getLoanData('0x71f4CF5Cfb74a9D3c9060aC4c25070F989cFC39C')
    expect(data).toBeTruthy()
  })

  it('Should check isCollateralPriceUpdated via api', async () => {
    const data = await request.isCollateralPriceUpdated('0x71f4CF5Cfb74a9D3c9060aC4c25070F989cFC39C')
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
    const data = await request.create('0x4206925f7652a5af8a0F48aB714ABbd1EF27D916', {
      loanAmount: 0.0416,
      moe: 'ETH',
      collateralAmount: 1000,
      collateralType: 'LEND',
      mpr: 2,
      duration: 7
    })
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

  it('Should get payback transaction from api', async () => {
    const data = await request.payback(
      '0xb83AE5BE607fCA481dCB3a95843c7423A111f655',
      '0x4206925f7652a5af8a0F48aB714ABbd1EF27D916'
    )
    expect(data).toBeTruthy()
  })
})
