# AAVE-JS

AAVE is a decentralized non-custodial liquidity market protocol where users can participate as depositors or borrowers. The AAVE Protocol is a set of open source smart contracts which facilitate the lending and borrowing of user funds. These contracts, and all user transactions/balances are stored on a public ledger called a blockchain, making them accessible to anyone.

The aave-js package gives developers access to methods for formatting data and executing transactions on the AAVE protocol.

1. [Quick Start](#quick-start)
2. [Data Formatting Methods](#data-formatting-methods)
   - a. [User Data](#user-data)
      - [formatUserSummaryData](#formatUserSummaryData) 
   - b. [Reserve Data](#reserve-data)
      - [formatReserves](#formatReserves) 
3. [Transaction Methods](#transaction-methods)
   - a. [Lending Pool V2](#lending-pool-v2)
      - [deposit](#deposit)
      - [borrow](#borrow)
      - [repay](#repay)
      - [withdraw](#withdraw)
      - [swapBorrowRateMode](#swapBorrowRateMode)
      - [setUsageAsCollateral](#setUsageAsCollateral)
      - [liquidationCall](#liquidationCall)
      - [swapCollateral](#swapCollateral)
      - [repayWithCollateral](#repayWithCollateral)
   - b. [Staking](#staking)
      - [stake](#stake)
      - [redeem](#redeem)
      - [cooldown](#cooldown)
      - [claimRewards](#claimRewards)
   - c. [Governance V2](#governancev2)
      - [Governance](#governance)
      - [create](#create)
      - [cancel](#cancel)
      - [queue](#queue)
      - [execute](#execute)
      - [submitVote](#submitVote)
      - [GovernanceDelegation](#governanceDelegation)
      - [delegate](#delegate)
      - [delegateByType](#delegateByType)
   - d. [Faucets](#faucets)
      - [mint](#mint)
4. [Lint](#lint)
5. [Build](#build)


# Quick Start

This package uses [ethers v5](https://github.com/ethers-io/ethers.js#readme) as peer dependency, so make sure you have installed it in your project.

```bash
npm install --save ethers
```

## Installing

```bash
npm install --save @aave/protocol-js
```

# Data Formatting Methods

AAVE aggregates on-chain protocol data into a variety of different subgraphs on TheGraph which can be queried directly using the playground (links below) and integrated into applications directly via TheGraph API. 

The aave-js data formatting methods are a layer beyond graphql which wraps protocol data into more usable formats. Each method will require inputs from AAVE subgraph queries, links to these queries in the source code are provided for each method below.

Check out this [getting started](https://docs.aave.com/developers/getting-started/using-graphql) guide to get your application integrated with the AAVE subgraphs

- V1 GraphQL:
   - Playground: https://thegraph.com/explorer/subgraph/aave/protocol-multy-raw
   - API: https://api.thegraph.com/subgraphs/name/aave/protocol-multy-raw

- V2 GraphQL (V2 Market and AMM Market)
	- Playground: https://thegraph.com/explorer/subgraph/aave/protocol-v2
	- API: https://api.thegraph.com/subgraphs/name/aave/protocol-v2

The V2 Subgraph contains data for both the V2 and AMM markets. The market which a reserve belongs to can be identified with the pool parameter (market address). The pool id for available markets are below:

- V2 Market: "0xb53c1a33016b2dc2ff3653530bff1848a515c8c5"
- AMM Market: "0xacc030ef66f9dfeae9cbb0cd1b25654b82cfa8d5"

## Sample Usage

```js
import { v1, v2 } from '@aave/protocol-js';

// Fetch poolReservesData from GQL Subscription
// Fetch rawUserReserves from GQL Subscription
// Fetch ethPriceUSD from GQL Subscription

let userAddress = "0x..."

let userSummary = v2.formatUserSummaryData(poolReservesData, rawUserReserves, userAddress.toLowerCase(), Math.floor(Date.now() / 1000))

```

## User Data

### formatUserSummaryData

Returns formatted summary of AAVE user portfolio including: array of holdings, total liquidity, total collateral, total borrows, liquidation threshold, health factor, and available borrowing power 

- @param `poolReservesData` GraphQL input:
	- subscription: src/[v1 or v2]/graphql/subscriptions/reserves-update-subscription.graphql
      : Requires input of pool (address of market which can be found above, or remove this filter to fetch all markets)
	- types: src/[v1 or v2]/graphql/fragments/pool-reserve-data.graphql
- @param `rawUserReserves` GraphQL input, query can be found here: 
   - subscription: src/[v1 or v2]/graphql/subscriptions/user-position-update-subscription.graphql
      : Requires input of user (lowercase address), and pool (address of market which can be found above, or remove this filter to fetch all markets)
   - types: src/[v1 or v2]/graphql/fragments/user-reserve-data.graphql
- @param `userId` Wallet address, MUST BE LOWERCASE!
- @param `usdPriceEth` Current price of USD in ETH in small units (10^18). For example, if ETH price in USD = $1900, usdPriceEth = (1 / 1900) * 10^18
   : Can also be fetched using this subscription: /src/[v1 or v2]/graphql/subscriptions/usd-price-eth-update-subscription.graphql
- @param `currentTimestamp` Current Unix timestamp in seconds: Math.floor(Date.now() / 1000)

```
v1.formatUserSummaryData(
  poolReservesData: ReserveData[],
  rawUserReserves: UserReserveData[],
  userId: string,
  usdPriceEth: BigNumberValue,
  currentTimestamp: number
);

v2.formatUserSummaryData(
  poolReservesData: ReserveData[],
  rawUserReserves: UserReserveData[],
  userId: string,
  usdPriceEth: BigNumberValue,
  currentTimestamp: number
);
```

## Reserve Data

### formatReserves

Returns formatted summary of each AAVE reserve asset 

Note: liquidityRate = deposit rate in the return object

- @param `reserves` GraphQL input: 
	- subscription: src/[v1 or v2]/graphql/subscriptions/reserves-update-subscription.graphql
      : Requires input of pool (address of market which can be found above, or remove this filter to fetch all markets)
	- types: src/[v1 or v2]/graphql/fragments/pool-reserve-data.graphql
- @param `reservesIndexed30DaysAgo` GraphQL input:
   - subscription: src/[v1 or v2]/graphql/subscriptions/reserve-rates-30-days-ago.graphql
   - types: src/[v1 or v2]/graphql/fragments/reserve-rates-history-data.graphql

```
v1.formatReserves(
	reserves, // ReserveData[] 
	reservesIndexed30DaysAgo, // ? ReserveRatesData[]
);

v2.formatReserves(
	reserves, // ReserveData[] 
	reservesIndexed30DaysAgo, // ? ReserveRatesData[]
);
```

# Transaction Methods

## Markets and Networks

The library exports the enabled networks and markets in the Aave protocol as the enums `Network` and `Market`

```
import { Network, Market } from '@aave/protocol-js';
```

## Usage

```
import { TxBuilderV2, Network, Market } from '@aave/protocol-js'

const httpProvider = new Web3.providers.HttpProvider(
    process.env.ETHEREUM_URL ||
      "https://kovan.infura.io/v3/<project_id>"
  );
const txBuilder = new TxBuilderV2(Network.main, httpProvider);

lendingPool = txBuilder.getLendingPool(Market.main); // get all lending pool methods
```

## Providers

The library accepts 3 kinds of providers:

- web3 provider
- JsonRPC url
- no provider: if no provider is passed it will default to ethers Infura / etherscan providers (shared providers, do not use in production)

To learn more about supported providers, see the [ethers documentation on providers](https://docs.ethers.io/v5/api/providers/#providers).

## Lending Pool V2

Object that contains all the necessary methods to create Aave lending pool transactions.

The return object will be a Promise array of objects of type:

```
import { EthereumTransactionTypeExtended } from '@aave/protocol-js'
```

having {tx, txType}

- tx: object with transaction fields.
- txType: string determining the kinds of transaction.

### deposit

Deposits the underlying asset into the reserve. A corresponding amount of the overlying asset (aTokens) is minted.

- @param `user` The ethereum address that will make the deposit
- @param `reserve` The ethereum address of the reserve
- @param `amount` The amount to be deposited
- @param @optional `onBehalfOf` The ethereum address for which user is depositing. It will default to the user address
- @param @optional `referralCode` Integrators are assigned a referral code and can potentially receive rewards. It defaults to 0 (no referrer)

```
lendingPool.deposit({
   user, // string,
   reserve, // string,
   amount, // string,
   onBehalfOf, // ? string,
   referralCode, // ? string,
});
```

If the `user` is not approved, an approval transaction will also be returned.

### borrow

Borrow an `amount` of `reserve` asset.

User must have a collaterised position (i.e. aTokens in their wallet)

- @param `user` The ethereum address that will receive the borrowed amount
- @param `reserve` The ethereum address of the reserve asset
- @param `amount` The amount to be borrowed, in human readable units (e.g. 2.5 ETH)
- @param `interestRateMode` Whether the borrow will incur a stable or variable interest rate (1 | 2)
- @param @optional `debtTokenAddress` The ethereum address of the debt token of the asset you want to borrow. Only needed if the reserve is ETH mock address
- @param @optional `onBehalfOf` The ethereum address for which user is borrowing. It will default to the user address
- @param @optional `refferalCode` Integrators are assigned a referral code and can potentially receive rewards. It defaults to 0 (no referrer)

```
enum InterestRate {
  None = 'None',
  Stable = 'Stable',
  Variable = 'Variable',
}

lendingPool.borrow({
   user, // string,
   reserve, // string,
   amount, // string,
   interestRateMode, // InterestRate;
   debtTokenAddress, // ? string;
   onBehalfOf, // ? string;
   referralCode, // ? string;
});
```

### repay

Repays a borrow on the specific reserve, for the specified amount (or for the whole amount, if (-1) is specified).
the target user is defined by `onBehalfOf`. If there is no repayment on behalf of another account, `onBehalfOf` must be equal to `user`.

- @param `user` The ethereum address that repays
- @param `reserve` The ethereum address of the reserve on which the user borrowed
- @param `amount` The amount to repay, or (-1) if the user wants to repay everything
- @param `interestRateMode` Whether the borrow will incur a stable or variable interest rate (1 | 2)
- @param @optional `onBehalfOf` The ethereum address for which user is repaying. It will default to the user address

```
enum InterestRate {
  None = 'None',
  Stable = 'Stable',
  Variable = 'Variable',
}

lendingPool.repay({
   user, // string,
   reserve, // string,
   amount, // string,
   interestRateMode, // InterestRate;
   onBehalfOf, // ? string
});
```

If the `user` is not approved, an approval transaction will also be returned.

### withdraw

Withdraws the underlying asset of an aToken asset.

- @param `user` The ethereum address that will receive the aTokens
- @param `reserve` The ethereum address of the reserve asset
- @param `amount` The amount of aToken being redeemed
- @param @optional `aTokenAddress` The ethereum address of the aToken. Only needed if the reserve is ETH mock address
- @param @optional `onBehalfOf` The amount of aToken being redeemed. It will default to the user address

```
lendingPool.withdraw({
   user, // string,
   reserve, // string,
   amount, // string,
   aTokenAddress, // ? string,
   onBehalfOf, // ? string
});
```

### swapBorrowRateMode

Borrowers can use this function to swap between stable and variable borrow rate modes.

- @param `user` The ethereum address that wants to swap rate modes
- @param `reserve` The address of the reserve on which the user borrowed
- @param `interestRateMode` Whether the borrow will incur a stable or variable interest rate (1 | 2)

```
enum InterestRate {
  None = 'None',
  Stable = 'Stable',
  Variable = 'Variable',
}

lendingPool.swapBorrowRateMode({
   user, // string,
   reserve, // string,
   interestRateMode, // InterestRate;
});
```

### setUsageAsCollateral

Allows depositors to enable or disable a specific deposit as collateral.

- @param `user` The ethereum address that enables or disables the deposit as collateral
- @param `reserve` The ethereum address of the reserve
- @param `useAsCollateral` True if the user wants to use the deposit as collateral, false otherwise.

```
lendingPool.setUsageAsCollateral({
   user, // string,
   reserve, // string,
   usageAsCollateral, // boolean
});
```

### liquidationCall

Users can invoke this function to liquidate an undercollateralized position.

- @param `liquidator` The ethereum address that will liquidate the position
- @param `liquidatedUser` The address of the borrower
- @param `debtReserve` The ethereum address of the principal reserve
- @param `collateralReserve` The address of the collateral to liquidated
- @param `purchaseAmount` The amount of principal that the liquidator wants to repay
- @param @optional `getAToken` Boolean to indicate if the user wants to receive the aToken instead of the asset. Defaults to false

```
lendingPool.liquidationCall({
  liquidator, // string;
  liquidatedUser, // string;
  debtReserve, // string;
  collateralReserve, // string;
  purchaseAmount, // string;
  getAToken, // ? boolean;
});
```

### swapCollateral

Allows users to swap a collateral to another asset

- @param `user` The ethereum address that will liquidate the position
- @param @optional `flash` If the transaction will be executed through a flasloan(true) or will be done directly through the adapters(false). Defaults to false
- @param `fromAsset` The ethereum address of the asset you want to swap
- @param `fromAToken` The ethereum address of the aToken of the asset you want to swap
- @param `toAsset` The ethereum address of the asset you want to swap to (get)
- @param `fromAmount` The amount you want to swap
- @param `toAmount` The amount you want to get after the swap
- @param `maxSlippage` The max slippage that the user accepts in the swap
- @param @optional `permitSignature` A permit signature of the tx. Only needed when previously signed (Not needed at the moment).
- @param `swapAll` Bool indicating if the user wants to swap all the current collateral
- @param @optional `onBehalfOf` The ethereum address for which user is swaping. It will default to the user address
- @param @optional `referralCode` Integrators are assigned a referral code and can potentially receive rewards. It defaults to 0 (no referrer)
- @param @optional `useEthPath` Boolean to indicate if the swap will use an ETH path. Defaults to false

```
type PermitSignature = {
  amount: tStringCurrencyUnits;
  deadline: string;
  v: number;
  r: BytesLike;
  s: BytesLike;
};

await lendingPool.swapCollateral({
   user, // string;
   flash, // ? boolean;
   fromAsset, // string;
   fromAToken, // string;
   toAsset, // string;
   fromAmount, // string;
   toAmount, // string;
   maxSlippage, // string;
   permitSignature, // ? PermitSignature;
   swapAll, // boolean;
   onBehalfOf, // ? string;
   referralCode, // ? string;
   useEthPath, // ? boolean;
});
```

### repayWithCollateral

Allows a borrower to repay the open debt with the borrower collateral

- @param `user` The ethereum address that will liquidate the position
- @param `fromAsset` The ethereum address of the asset you want to repay with (collateral)
- @param `fromAToken` The ethereum address of the aToken of the asset you want to repay with (collateral)
- @param `assetToRepay` The ethereum address of the asset you want to repay
- @param `repayWithAmount` The amount of collateral you want to repay the debt with
- @param `repayAmount` The amount of debt you want to repay
- @param `permitSignature` A permit signature of the tx. Optional
- @param @optional `repayAllDebt` Bool indicating if the user wants to repay all current debt. Defaults to false
- @param `rateMode` Enum indicating the type of the interest rate of the collateral
- @param @optional `onBehalfOf` The ethereum address for which user is swaping. It will default to the user address
- @param @optional `referralCode` Integrators are assigned a referral code and can potentially receive rewards. It defaults to 0 (no referrer)
- @param @optional `flash` If the transaction will be executed through a flasloan(true) or will be done directly through the adapters(false). Defaults to false
- @param @optional `useEthPath` Boolean to indicate if the swap will use an ETH path. Defaults to false

```
enum InterestRate {
  None = 'None',
  Stable = 'Stable',
  Variable = 'Variable',
}

await lendingPool.repayWithCollateral({
   user, // string;
   fromAsset, // string;
   fromAToken, // string;
   assetToRepay, // string
   repayWithAmount, // string;
   repayAmount, // string;
   permitSignature, // ? PermitSignature;
   repayAllDebt, // ? boolean;
   rateMode, // InterestRate;
   onBehalfOf, // ? string;
   referralCode, // ? string;
   flash, // ? boolean;
   useEthPath, // ? boolean;
});
```

## Governance V2

Example of how to use the governance service

```
import {
  TxBuilderV2,
  AaveGovernanceV2Interface,
  GovernanceDelegationTokenInterface,
} from '@aave/protocol-js';

const httpProvider = new Web3.providers.HttpProvider(
   process.env.ETHEREUM_URL ||
   "https://kovan.infura.io/v3/<project_id>"
);
const txBuilder = new TxBuilderV2(Network.main, httpProvider);
const gov2 = txBuilder.aaveGovernanceV2Service;
const powerDelegation = txBuilder.governanceDelegationTokenService;
```

### create

Creates a Proposal (needs to be validated by the Proposal Validator)

- @param `user` The ethereum address that will create the proposal
- @param `targets` list of contracts called by proposal's associated transactions
- @param `values` list of value in wei for each propoposal's associated transaction
- @param `signatures` list of function signatures (can be empty) to be used when created the callData
- @param `calldatas` list of calldatas: if associated signature empty, calldata ready, else calldata is arguments
- @param `withDelegatecalls` boolean, true = transaction delegatecalls the taget, else calls the target
- @param `ipfsHash` IPFS hash of the proposal
- @param `executor` The ExecutorWithTimelock contract that will execute the proposal

```
enum ExecutorType {
  Short,
  Long,
}

--------

gov2.create({
  user. // string;
  targets, //string[];
  values, // string[];
  signatures, // string[];
  calldatas, // BytesLike[];
  withDelegateCalls, // boolean[];
  ipfsHash, // BytesLike;
  executor, // ExecutorType;
});
```

### cancel

Cancels a Proposal.
Callable by the \_guardian with relaxed conditions, or by anybody if the conditions of cancellation on the executor are fulfilled

- @param `user` The ethereum address that will create the proposal
- @param `proposalId` Id of the proposal we want to cancel

```
gov2.cancel({
   user, // string
   proposalId, // number
})
```

### queue

Queue the proposal (If Proposal Succeeded)

- @param `user` The ethereum address that will create the proposal
- @param `proposalId` Id of the proposal we want to queue

```
gov2.queue({
   user, // string
   proposalId, // number
})
```

### execute

Execute the proposal (If Proposal Queued)

- @param `user` The ethereum address that will create the proposal
- @param `proposalId` Id of the proposal we want to execute

```
gov2.execute({
   user, // string
   proposalId, // number
})
```

### submitVote

Function allowing msg.sender to vote for/against a proposal

- @param `user` The ethereum address that will create the proposal
- @param `proposalId` Id of the proposal we want to vote
- @param `support` Bool indicating if you are voting in favor (true) or against (false)

```
gov2.submitVote({
   user, // string
   proposalId, // number
   support, // boolean
})
```

## Governance Delegation

### delegate

Method for the user to delegate voting `and` proposition power to the chosen address

- @param `user` The ethereum address that will create the proposal
- @param `delegatee` The ethereum address to which the user wants to delegate proposition power and voting power
- @param `governanceToken` The ethereum address of the governance token

```
powerDelegation.delegate({
   user, // string
   delegatee,  // string
   governanceToken // string
});
```

### delegateByType

Method for the user to delegate voting `or` proposition power to the chosen address

- @param `user` The ethereum address that will create the proposal
- @param `delegatee` The ethereum address to which the user wants to delegate proposition power and voting power
- @param `delegationType` The type of the delegation the user wants to do: voting power ('0') or proposition power ('1')
- @param `governanceToken` The ethereum address of the governance token

```
powerDelegation.delegateByType({
   user, // string
   delegatee,  // string
   delegationType, // string
   governanceToken // string
});
```

## Faucets

To use the testnet faucets which are compatible with Aave:

```
import { TxBuilderV2, Network, Market } from '@aave/protocol-js'

const httpProvider = new Web3.providers.HttpProvider(
    process.env.ETHEREUM_URL ||
      "https://kovan.infura.io/v3/<project_id>"
  );
const txBuilder = new TxBuilderV2(Network.main, httpProvider);
const faucet = txBuilder.faucetService;
```

### mint

Mint tokens for the usage on the Aave protocol on the Kovan network. The amount of minted tokens is fixed and depends on the token

- @param `userAddress` The ethereum address of the wallet the minted tokens will go
- @param `reserve` The ethereum address of the token you want to mint
- @param `tokenSymbol` The symbol of the token you want to mint

```
faucet.mint({
   userAddress, // string
   reserve, // string
   tokenSymbol, // string
});
```

## Lint

To lint we use EsLint with typescript plugins and extending Airbnb

```
npm run lint
```

## Build

To build run:

```
npm run build // builds with tsdx
npm run build:tsc // builds with tsc
```