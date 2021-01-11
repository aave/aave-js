import { ReserveData } from '../../v1/types';
import { formatReserves } from '../../v1/computations-and-formatting';

const mockReserve: ReserveData = {
  underlyingAsset: '0xff795577d9ac8bd7d90ee22b6c1703490b6512fd',
  name: '',
  symbol: 'DAI',
  decimals: 18,
  baseLTVasCollateral: '7500',
  reserveLiquidationThreshold: '8000',
  reserveLiquidationBonus: '10500',
  usageAsCollateralEnabled: true,
  borrowingEnabled: true,
  stableBorrowRateEnabled: true,
  isActive: true,
  liquidityIndex: '1000164447379610590574518134',
  variableBorrowIndex: '1000232854433711209646283880',
  liquidityRate: '26776200735312093055313462',
  variableBorrowRate: '38568743388028395681971229',
  stableBorrowRate: '109284371694014197840985614',
  lastUpdateTimestamp: 1606992400,
  // interestRateStrategyAddress: '0x1c4c4dD7F19738Fd7C21Fa7CbF9667710ff3Ba4c',
  availableLiquidity: '43133641118657852003256',
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
  totalBorrows: '0',
  totalBorrowsStable: '0',
  totalBorrowsVariable: '0',
  isFreezed: true,
  averageStableBorrowRate: '0',
  utilizationRate: '0',
  totalLiquidity: '0',
  aToken: {
    id: '0x0',
  },
};

describe('computations and formattings', () => {
  describe('formatReserves', () => {
    it('should return plausible results', () => {
      const formattedMockReserve = formatReserves([mockReserve])[0];
      expect(formattedMockReserve).toMatchSnapshot();
    });

    /**
     * Whenever we add a new asset there#s a chance that an asset has no paramsHistory from 30days ago
     * We should not throw if that's the case, but just ignore it
     */
    it("should not error When 30dago reserves doesn't contain paramsHistory", () => {
      formatReserves([mockReserve], [mockReserve as any]);
      formatReserves(
        [mockReserve],
        [{ ...mockReserve, paramsHistory: [] } as any]
      );
      // would be wrong if any of the above threw
      expect(true).toBe(true);
    });
  });
});
