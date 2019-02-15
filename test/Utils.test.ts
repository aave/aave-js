import Utils from '../src/services/Utils'
/**
 * Utils test
 */
describe('Utils test', () => {
  const utils = new Utils('86C019FF04C4', 'http://localhost:3333')

  it('Utils is instantiable', () => {
    expect(utils).toBeInstanceOf(Utils)
  })

  it('Should handle signup', async () => {
    const email = `s${new Date().getTime()}@email.com`
    const token = await utils.signup(email, 'name', 'pssdesdsds')
    expect(token).toBeTruthy()
  })

  it('Should handle token renewal', async () => {
    const email = `ss${new Date().getTime()}@email.com`
    const token = await utils.signup(email, 'name', 'pssdesdsds')
    const newToken = await utils.renewToken(email, 'pssdesdsds')
    expect(token).toBeTruthy()
  })

  it('Should handle token approval requests', async () => {
    const data = await utils.approveTransfer('0x4206925f7652a5af8a0F48aB714ABbd1EF27D916', 'LEND')
    expect(data).toBeTruthy()
  })

  it('Should handle isTransferApproved requests', async () => {
    const data = await utils.isTransferApproved('0x4206925f7652a5af8a0F48aB714ABbd1EF27D916', 'LEND', 100)
    expect(data).toBeTruthy()
  })
})
