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
    expect(data.code).toBe(200)
  })

  it('Should load requests metadata from api', async () => {
    const data = await request.getMetadata()
    expect(data.code).toBe(200)
  })

  it('Should get single loan data from api', async () => {
    const data = await request.getLoanData('0x71f4CF5Cfb74a9D3c9060aC4c25070F989cFC39C')
    expect(data.code).toBe(200)
  })

  it('Should get all loans by borrower data from api', async () => {
    const data = await request.getLoansByBorrower('0x4206925f7652a5af8a0F48aB714ABbd1EF27D916')
    expect(data.code).toBe(200)
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
    expect(data.code).toBe(200)
  })

  it('Should get placeCollateral transaction from api', async () => {
    const data = await request.placeCollateral(
      '0x71f4CF5Cfb74a9D3c9060aC4c25070F989cFC39C',
      '0x4206925f7652a5af8a0F48aB714ABbd1EF27D916'
    )
    expect(data.code).toBe(200)
  })

  it('Should get fund transaction from api', async () => {
    const data = await request.fund(
      '0x71f4CF5Cfb74a9D3c9060aC4c25070F989cFC39C',
      '0x4206925f7652a5af8a0F48aB714ABbd1EF27D916',
      0.05
    )
    expect(data.code).toBe(200)
  })

  it('Should get payback transaction from api', async () => {
    const data = await request.payback(
      '0x71f4CF5Cfb74a9D3c9060aC4c25070F989cFC39C',
      '0x4206925f7652a5af8a0F48aB714ABbd1EF27D916'
    )
    expect(data.code).toBe(200)
  })
})
