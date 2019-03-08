import LoanOffer from '../src/services/LoanOffer'
import { LoanOfferModel } from '../src/types';

/**
 * LoanOffer test
 */
describe('LoanOffer test', () => {
  const offer = new LoanOffer(
    'a94be1bc8e770454d8c7e7a23f2d205ecd6003c341d7a28e88',
    'https://apikovan.aave.com/'
  )

  it('LoanOffer is instantiable', () => {
    expect(offer).toBeInstanceOf(LoanOffer)
  })

  it('Should load all addresses from api', async () => {
    const data = await offer.getAllAddresses()
    expect(data).toBeTruthy()
  })

  it('Should load requests metadata from api', async () => {
    const data = await offer.getMetadata()
    expect(data).toBeTruthy()
  })

  it('Should get single loan data from api', async () => {
    const data = await offer.getLoanData('0x22BE4D305692C1da3EAA7A6D487C44C70CfE9a74')
    expect(data).toBeTruthy()
  })

  it('Should check isCollateralPriceUpdated via api', async () => {
    const data = await offer.isCollateralPriceUpdated('0x22BE4D305692C1da3EAA7A6D487C44C70CfE9a74')
    expect(data).toBeFalsy()
  })

  it('Should get refreshCollateralPrice transaction via api', async () => {
    const data = await offer.refreshCollateralPrice(
      '0x22BE4D305692C1da3EAA7A6D487C44C70CfE9a74',
      '0x4206925f7652a5af8a0F48aB714ABbd1EF27D916'
    )
    expect(data).toBeTruthy()
  })

  it('Should get all loans by borrower data from api', async () => {
    const data = await offer.getLoansByBorrower('0x4206925f7652a5af8a0F48aB714ABbd1EF27D916')
    expect(data).toBeTruthy()
  })

  it('Should get all loans by lender data from api', async () => {
    const data = await offer.getLoansByLender('0x4206925f7652a5af8a0F48aB714ABbd1EF27D916')
    expect(data).toBeTruthy()
  })

  it('Should get all loans data from api', async () => {
    const data = await offer.getDataAllLoans()
    expect(data).toBeTruthy()
  })

  it('Should get loan creation transaction from api', async () => {
    const loanData : LoanOfferModel = {
      moe: 'ETH',
      minimumLoanAmount: 0.1,
      maximumLoanAmount: 1,
      collaterals: [{id: 0, symbol: 'LEND', mpr: 0.25, ltv: 50, valid: true}],
      durationRange: {min:1, max: 12},
      type: "OFFER",
      loanAmount: 0,
      collateralAmount: 0,
      collateralType: "",
      mpr:0,
      outstandingLoanAmount: 0,
      duration: 0
    };

    const data = await offer.create('0x4206925f7652a5af8a0F48aB714ABbd1EF27D916', loanData)
    expect(data).toBeTruthy()
  })


  it('Should get fund transaction from api', async () => {
    const data = await offer.fund(
      '0x71f4CF5Cfb74a9D3c9060aC4c25070F989cFC39C',
      '0x4206925f7652a5af8a0F48aB714ABbd1EF27D916'
    )
    expect(data).toBeTruthy()
  })

  it('Should get payback transaction from api', async () => {
    const data = await offer.payback(
      '0xb83AE5BE607fCA481dCB3a95843c7423A111f655',
      '0x4206925f7652a5af8a0F48aB714ABbd1EF27D916'
    )
    expect(data).toBeTruthy()
  })
})
