import { ReserveData } from '../types';
import { formatReserves } from '../computations-and-formatting';

const mockReserve: ReserveData = {
  averageStableRate: '10000000000000000000000000',
  stableDebtTokenAddress: '0x4da9b813057d04baef4e5800e36083717b4a0341',
  stableDebtLastUpdateTimestamp: '1606926715',
  totalPrincipalStableDebt: '6621866123278403767271000',
  variableDebtTokenAddress: '0x4da9b813057d04baef4e5800e36083717b4a0341',
  totalScaledVariableDebt: '6621866123278403767271000',
  reserveFactor: '3',
  aTokenAddress: '0x4da9b813057d04baef4e5800e36083717b4a0341',
  availableLiquidity: '66218661232784037672718264',
  baseLTVasCollateral: '75',
  baseVariableBorrowRate: '10000000000000000000000000',
  borrowingEnabled: true,
  decimals: 18,
  id:
    '0x0000000000085d4780b73119b644ae5ecd22b3760x24a42fd28c976a61df5d00d0599c34c4f90748c8',
  isActive: true,
  lastUpdateTimestamp: 1606926715,
  liquidityIndex: '1021198007172229931360360630',
  liquidityRate: '13621270986157659887198761',
  name: 'TrueUSD',
  optimalUtilisationRate: '800000000000000000000000000',
  price: {
    priceInEth: '1700010000000000',
  },
  reserveLiquidationBonus: '105',
  reserveLiquidationThreshold: '80',
  stableBorrowRate: '110472374939115775433749575',
  stableBorrowRateEnabled: false,
  stableRateSlope1: '140000000000000000000000000',
  stableRateSlope2: '600000000000000000000000000',
  symbol: 'TUSD',
  underlyingAsset: '0x0000000000085d4780b73119b644ae5ecd22b376',
  usageAsCollateralEnabled: true,
  variableBorrowIndex: '1034187289519163852355447269',
  variableBorrowRate: '31563535696890221552499878',
  variableRateSlope1: '40000000000000000000000000',
  variableRateSlope2: '1500000000000000000000000000',
  isFrozen: false,
};

describe('computations and formattings', () => {
  describe('formatReserves', () => {
    it('should return plausible results', () => {
      const formattedMockReserve = formatReserves(
        [mockReserve],
        mockReserve.lastUpdateTimestamp + 2000
      )[0];
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
