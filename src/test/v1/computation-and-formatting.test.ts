import { ReserveData } from '../../v1/types';
import { formatReserves } from '../../v1/computations-and-formatting';

const mockReserve: ReserveData = {
  aToken: {
    id: '0x4da9b813057d04baef4e5800e36083717b4a0341',
  },
  availableLiquidity: '5824853945378076424288347',
  averageStableBorrowRate: '0',
  baseLTVasCollateral: '75',
  baseVariableBorrowRate: '10000000000000000000000000',
  borrowingEnabled: true,
  decimals: 18,
  id:
    '0x0000000000085d4780b73119b644ae5ecd22b3760x24a42fd28c976a61df5d00d0599c34c4f90748c8',
  isActive: true,
  isFreezed: false,
  lastUpdateTimestamp: 1610384006,
  liquidityIndex: '1028018682355172244649416582',
  liquidityRate: '648573399981943727433625581',
  name: 'TrueUSD',
  optimalUtilisationRate: '800000000000000000000000000',
  price: {
    priceInEth: '1069659625790585',
  },
  reserveLiquidationBonus: '105',
  reserveLiquidationThreshold: '80',
  stableBorrowRate: '446340362753199494049981502',
  stableBorrowRateEnabled: false,
  stableRateSlope1: '140000000000000000000000000',
  stableRateSlope2: '600000000000000000000000000',
  symbol: 'TUSD',
  totalBorrows: '47344321261287322317434359',
  totalBorrowsStable: '281483116992398538448',
  totalBorrowsVariable: '47344039778170329918895911',
  totalLiquidity: '53169175206665398741722706',
  underlyingAsset: '0x0000000000085d4780b73119b644ae5ecd22b376',
  usageAsCollateralEnabled: true,
  utilizationRate: '0.89044678',
  variableBorrowIndex: '1043076946425418774221180231',
  variableBorrowRate: '728350906882998735124953755',
  variableRateSlope1: '40000000000000000000000000',
  variableRateSlope2: '1500000000000000000000000000',
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
