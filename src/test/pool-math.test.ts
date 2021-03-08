import { getCompoundedStableBalance } from '../helpers/pool-math';

describe('pool-math', () => {
  describe('getCompoundedStableBalance', () => {
    const daiDebt = {
      userId: '0x117611135c32649b0fb4893d781ffc8fb99a73eb',
      totalPrincipalStableDebt: '3517543407591028771061',
      stableBorrowRate: '119976606800654227278644138',
      decimals: 18,
      stableDebtLastUpdateTimestamp: 1613857745,
      symbol: 'DAI',
    };
    const ts = 1614248821;
    const balance = getCompoundedStableBalance(
      daiDebt.totalPrincipalStableDebt,
      daiDebt.stableBorrowRate,
      daiDebt.stableDebtLastUpdateTimestamp,
      ts
    );
    expect(balance.toString()).toBe('3.522780300627623423259');
  });
});
