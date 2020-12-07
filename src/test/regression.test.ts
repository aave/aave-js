import { formatUserSummaryData } from '../computations-and-formatting';

describe('regressions', () => {
  test('hf should be above 1', () => {
    const userReserves = [
      {
        currentTotalDebt: '0',
        id:
          '0x26d29cca0eee85153971511f358e896a3d2c9f950x2260fac5e5542a773aa44fbcfedf7c193bc2c5990xb53c1a33016b2dc2ff3653530bff1848a515c8c5',
        lastUpdateTimestamp: 1607031795,
        principalStableDebt: '0',
        reserve: {
          aToken: {
            id: '0x9ff58f4ffb29fa2266ab25e75e2a8b3503311656',
          },
          decimals: 8,
          id:
            '0x2260fac5e5542a773aa44fbcfedf7c193bc2c5990xb53c1a33016b2dc2ff3653530bff1848a515c8c5',
          lastUpdateTimestamp: 1607327667,
          liquidityRate: '38835780631082396702435729',
          name: 'Wrapped BTC',
          reserveLiquidationBonus: '11000',
          symbol: 'WBTC',
          underlyingAsset: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
          usageAsCollateralEnabled: true,
        },
        scaledATokenBalance: '254167477',
        scaledVariableDebt: '0',
        stableBorrowLastUpdateTimestamp: 0,
        stableBorrowRate: '0',
        usageAsCollateralEnabledOnUser: true,
        user: {
          id: '0x26d29cca0eee85153971511f358e896a3d2c9f95',
        },
        variableBorrowIndex: '1000478587753678491036602030',
      },
      {
        currentTotalDebt: '19000000000',
        id:
          '0x26d29cca0eee85153971511f358e896a3d2c9f950xdac17f958d2ee523a2206206994597c13d831ec70xb53c1a33016b2dc2ff3653530bff1848a515c8c5',
        lastUpdateTimestamp: 1607108498,
        principalStableDebt: '0',
        reserve: {
          aToken: {
            id: '0x3ed3b47dd13ec9a98b44e6204a523e766b225811',
          },
          decimals: 6,
          id:
            '0xdac17f958d2ee523a2206206994597c13d831ec70xb53c1a33016b2dc2ff3653530bff1848a515c8c5',
          lastUpdateTimestamp: 1607329252,
          liquidityRate: '36855887391053912130255258',
          name: 'Tether USD',
          reserveLiquidationBonus: '0',
          symbol: 'USDT',
          underlyingAsset: '0xdac17f958d2ee523a2206206994597c13d831ec7',
          usageAsCollateralEnabled: false,
        },
        scaledATokenBalance: '0',
        scaledVariableDebt: '18994141526',
        stableBorrowLastUpdateTimestamp: 0,
        stableBorrowRate: '0',
        usageAsCollateralEnabledOnUser: false,
        user: {
          id: '0x26d29cca0eee85153971511f358e896a3d2c9f95',
        },
        variableBorrowIndex: '1000306407417318480401613031',
      },
    ];

    const reserves = [
      {
        aToken: {
          id: '0x9ff58f4ffb29fa2266ab25e75e2a8b3503311656',
        },
        availableLiquidity: '2942115687',
        averageStableRate: '630255739366571882982312401',
        baseLTVasCollateral: '7000',
        baseVariableBorrowRate: '0',
        borrowingEnabled: true,
        decimals: 8,
        id:
          '0x2260fac5e5542a773aa44fbcfedf7c193bc2c5990xb53c1a33016b2dc2ff3653530bff1848a515c8c5',
        isActive: true,
        isFrozen: false,
        lastUpdateTimestamp: 1607327667,
        liquidityIndex: '1000749114858617436923582946',
        liquidityRate: '38835780631082396702435729',
        name: 'Wrapped BTC',
        optimalUtilisationRate: '650000000000000000000000000',
        price: {
          priceInEth: '292637452730474',
        },
        reserveFactor: '2000',
        reserveLiquidationBonus: '11000',
        reserveLiquidationThreshold: '7500',
        sToken: {
          id: '0x51b039b9afe64b78758f8ef091211b5387ea717c',
        },
        stableBorrowRate: '126611848849695989210127852',
        stableBorrowRateEnabled: true,
        stableDebtLastUpdateTimestamp: 1607312568,
        stableRateSlope1: '100000000000000000000000000',
        stableRateSlope2: '3000000000000000000000000000',
        symbol: 'WBTC',
        totalLiquidity: '7955736453',
        totalLiquidityAsCollateral: '1333907741',
        totalPrincipalStableDebt: '124494',
        totalScaledVariableDebt: '4958871977',
        underlyingAsset: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        usageAsCollateralEnabled: true,
        utilizationRate: '0.63018939',
        vToken: {
          id: '0x9c39809dec7f95f5e0713634a4d0701329b3b4d2',
        },
        variableBorrowIndex: '1001266706528376142936028278',
        variableBorrowRate: '77289479079756791368102282',
        variableRateSlope1: '80000000000000000000000000',
        variableRateSlope2: '3000000000000000000000000000',
      },
      {
        aToken: {
          id: '0x3ed3b47dd13ec9a98b44e6204a523e766b225811',
        },
        availableLiquidity: '132586018178',
        averageStableRate: '54856346180391310847337737',
        baseLTVasCollateral: '0',
        baseVariableBorrowRate: '0',
        borrowingEnabled: true,
        decimals: 6,
        id:
          '0xdac17f958d2ee523a2206206994597c13d831ec70xb53c1a33016b2dc2ff3653530bff1848a515c8c5',
        isActive: true,
        isFrozen: false,
        lastUpdateTimestamp: 1607329252,
        liquidityIndex: '1000630909686710755085800006',
        liquidityRate: '36855887391053912130255258',
        name: 'Tether USD',
        optimalUtilisationRate: '900000000000000000000000000',
        price: {
          priceInEth: '1671630000000000',
        },
        reserveFactor: '1000',
        reserveLiquidationBonus: '0',
        reserveLiquidationThreshold: '0',
        sToken: {
          id: '0xe91d55ab2240594855abd11b3faae801fd4c4687',
        },
        stableBorrowRate: '59395229187126190140115415',
        stableBorrowRateEnabled: true,
        stableDebtLastUpdateTimestamp: 1607328066,
        stableRateSlope1: '20000000000000000000000000',
        stableRateSlope2: '600000000000000000000000000',
        symbol: 'USDT',
        totalLiquidity: '1056783261417',
        totalLiquidityAsCollateral: '620313978184',
        totalPrincipalStableDebt: '460139119130',
        totalScaledVariableDebt: '448782455941',
        underlyingAsset: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        usageAsCollateralEnabled: false,
        utilizationRate: '0.87453811',
        vToken: {
          id: '0x531842cebbdd378f8ee36d171d6cc9c4fcf475ec',
        },
        variableBorrowIndex: '1000970388790262680911471929',
        variableBorrowRate: '38790458374252380280230830',
        variableRateSlope1: '40000000000000000000000000',
        variableRateSlope2: '600000000000000000000000000',
      },
    ];

    const flattenedReserves = reserves.map(reserve => ({
      ...reserve,
      aTokenAddress: reserve.aToken.id,
      stableDebtTokenAddress: reserve.sToken.id,
      variableDebtTokenAddress: reserve.vToken.id,
      stableDebtLastUpdateTimestamp: reserve.stableDebtLastUpdateTimestamp.toString(),
    }));

    const formattedSummary = formatUserSummaryData(
      flattenedReserves,
      userReserves,
      userReserves[0].user.id,
      '1673445529964706',
      Math.floor(Date.now() / 1000)
    );
    expect(Number(formattedSummary.healthFactor)).toBeGreaterThan(1);
  });
});
