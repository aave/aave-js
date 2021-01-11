# Aave Protocol js

Aave protocol logic package, supports main and uniswap markets

The simplest way to get initial protocol data - use our subgraphs on TheGraph protocol:
https://thegraph.com/explorer/subgraph/aave/protocol-multy-ropsten-raw - ropsten
https://thegraph.com/explorer/subgraph/aave/protocol-multy-kovan-raw - kovan
https://thegraph.com/explorer/subgraph/aave/protocol-multy-raw - mainnet

_/graphql/_ folder contains graphql documents with the structures needed for aggregation methods.

## Installation

```bash
// with npm
npm install @aave/protocol-js
// with yarn
yarn add @aave/protocol-js
```

## Usage

Here is a quick example to get you started:

```js
// there's a named version export per version
import { v1, v2 } from '@aave/protocol-js';

// returns user summary data in big units.
v1.formatUserSummaryData(
  poolReservesData,
  rawUserReserves,
  userId,
  usdPriceEth,
  currentTimestamp
);

// returns user summary data in small units with 0 decimal places, except health-factor.
v1.computeRawUserSummaryData(
  poolReservesData,
  rawUserReserves,
  userId,
  usdPriceEth,
  currentTimestamp
);

// returns reserves data formatted to big units.
v2.formatReserves(reserves, currentTimestamp);
```

## Braking changes in v1

- Endpoint addresses should be changed (addresses above)
- Graphql documents should be "recompiled"
- Reserve id not underlying asset address anymore, it's not unique enough because same asset can be in 2 or more pools.
- But reserve has underlyingAssetAddress field

## TODO

- Extra documentation
- Transactions encoding logic
- React hooks
- Tests
