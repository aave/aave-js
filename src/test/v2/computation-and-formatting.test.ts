import { ReserveData, UserReserveData } from '../../v2/types';
import {
  formatReserves,
  formatUserSummaryData,
} from '../../v2/computations-and-formatting';

const mockReserve: ReserveData = {
  underlyingAsset: '0xff795577d9ac8bd7d90ee22b6c1703490b6512fd',
  name: '',
  symbol: 'DAI',
  decimals: 18,
  baseLTVasCollateral: '7500',
  reserveLiquidationThreshold: '8000',
  reserveLiquidationBonus: '10500',
  reserveFactor: '1000',
  usageAsCollateralEnabled: true,
  borrowingEnabled: true,
  stableBorrowRateEnabled: true,
  isActive: true,
  isFrozen: false,
  liquidityIndex: '1000164447379610590574518134',
  variableBorrowIndex: '1000232854433711209646283880',
  liquidityRate: '26776200735312093055313462',
  variableBorrowRate: '38568743388028395681971229',
  stableBorrowRate: '109284371694014197840985614',
  lastUpdateTimestamp: 1606992400,
  aTokenAddress: '0xdCf0aF9e59C002FA3AA091a46196b37530FD48a8',
  stableDebtTokenAddress: '0x3B91257Fe5CA63b4114ac41A0d467D25E2F747F3',
  variableDebtTokenAddress: '0xEAbBDBe7aaD7d5A278da40967E62C8c8Fe5fAec8',
  // interestRateStrategyAddress: '0x1c4c4dD7F19738Fd7C21Fa7CbF9667710ff3Ba4c',
  availableLiquidity: '43133641118657852003256',
  totalPrincipalStableDebt: '1000000000000000000',
  averageStableRate: '109284236984257451326752610',
  stableDebtLastUpdateTimestamp: '1606992400',
  totalScaledVariableDebt: '145496831599325217573288',
  // priceInEth: '1634050000000000',
  variableRateSlope1: '40000000000000000000000000',
  variableRateSlope2: '750000000000000000000000000',
  stableRateSlope1: '20000000000000000000000000',
  stableRateSlope2: '750000000000000000000000000',
  id:
    '0xff795577d9ac8bd7d90ee22b6c1703490b6512fd0x88757f2f99175387ab4c6a4b3067c77a695b0349',
  price: { priceInEth: '1634050000000000' },
  // fake data
  optimalUtilisationRate: '109284236984257451326752610',
  baseVariableBorrowRate: '109284236984257451326752610',
};

const mockUserReserve: UserReserveData = {
  // underlyingAsset: '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD',
  scaledATokenBalance: '0',
  usageAsCollateralEnabledOnUser: false,
  stableBorrowRate: '0',
  scaledVariableDebt: '137602026075945229933190',
  principalStableDebt: '0',
  stableBorrowLastUpdateTimestamp: 0,
  variableBorrowIndex: '0',
  //id:0cd96fb5ee9616f64d892644f53f35be4f90xff795577d9ac8bd7d90ee22b6c1703490b6512fd0x88757f2f99175387ab4c6a4b3067c77a695b0349',
  reserve: {
    id:
      '0xff795577d9ac8bd7d90ee22b6c1703490b6512fd0x88757f2f99175387ab4c6a4b3067c77a695b0349',
    underlyingAsset: '0xff795577d9ac8bd7d90ee22b6c1703490b6512fd',
    name: '',
    symbol: 'DAI',
    decimals: 18,
    liquidityRate: '27070210296933117164358651',
    reserveLiquidationBonus: '10500',
    lastUpdateTimestamp: 1607000068,
  },
};

describe('computations and formattings', () => {
  describe('formatUserSummaryData', () => {
    const formattedMockReserve = formatUserSummaryData(
      [mockReserve],
      [mockUserReserve],
      '0cd96fb5ee9616f64d892644f53f35be4f90xff795577d9ac8bd7d90ee22b6c1703490b6512fd0x88757f2f99175387ab4c6a4b3067c77a695b0349',
      '100',
      mockUserReserve.reserve.lastUpdateTimestamp + 2000
    );
    expect(
      formattedMockReserve.reservesData[0].reserve.reserveLiquidationBonus
    ).toBe('0.05');
    expect(formattedMockReserve).toMatchSnapshot();
  });

  describe('formatReserves', () => {
    it('should return plausible results', () => {
      const formattedMockReserve = formatReserves(
        [mockReserve],
        mockReserve.lastUpdateTimestamp + 2000
      )[0];
      expect(formattedMockReserve.baseLTVasCollateral).toBe('0.75');
      expect(formattedMockReserve).toMatchSnapshot();
    });

    it('should return proper values for new reserves', () => {
      const newReserve: Partial<ReserveData> = {
        availableLiquidity: '0',
        totalPrincipalStableDebt: '0',
        totalScaledVariableDebt: '0',
      };
      const formattedMockReserve = formatReserves(
        [
          {
            ...mockReserve,
            ...newReserve,
          },
        ],
        mockReserve.lastUpdateTimestamp
      )[0];
      expect(formattedMockReserve.utilizationRate).toBe('0');
    });
  });
});
