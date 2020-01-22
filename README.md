# Aave Protocol js

Beta version of the Aave protocol logic package


The simplest way to get initial protocol data - use our subgraphs on TheGraph protocol:
https://thegraph.com/explorer/subgraph/aave/protocol-ropsten-raw - ropsten
https://thegraph.com/explorer/subgraph/aave/protocol-raw - mainnet

_/graphql/_ folder contains graphql documents with the structures needed for aggregation methods.

## Methods description

```formatUserSummaryData(poolReservesData, rawUserReserves, userId, usdPriceEth, currentTimestamp)```

returns user summary data in big units.

```computeRawUserSummaryData(poolReservesData, rawUserReserves, userId, usdPriceEth, currentTimestamp)```

returns user summary data in small units with 0 decimal places, except health-factor.

```formatReserves(reserves)```

returns reserves data formatted to big units.

## TODO
* Extra documentation
* Transactions encoding logic
* React hooks
* Tests
