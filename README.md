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

If you want to use the built-in graphql queries & subscriptions you can find them in `dist/v<1|2>/graphql`.

## Braking changes in v1

- Endpoint addresses should be changed (addresses above)
- Graphql documents should be "recompiled"
- Reserve id not underlying asset address anymore, it's not unique enough because same asset can be in 2 or more pools.
- But reserve has underlyingAssetAddress field

## Braking changes in v2

- the main entry-point exports v2 methods & graphql queries

```js
// before
import { formatUserSummaryData } from '@aave/protocol-js';

formatUserSummaryData();

// after
import { v1 } from '@aave/protocol-js';

v1.formatUserSummaryData();
```

## TODO

- Extra documentation
- Transactions encoding logic
- React hooks
- Tests

# Transaction Building for Aave protocol

This library can be used to easily interact with the Aave protocol.

# Transaction methods

1. [Quick Start](#quickstart)
2. [Lending Pool V2](#lendingpool)
   - [deposit](#deposit)
   - [borrow](#borrow)
   - [repay](#repay)
   - [withdraw](#withdraw)
   - [swapBorrowRateMode](#swapBorrowRateMode)
   - [setUsageAsCollateral](#setUsageAsCollateral)
   - [liquidationCall](#liquidationCall)
   - [swapCollateral](#swapCollateral)
   - [repayWithCollateral](#repayWithCollateral)
3. [Staking](#staking)
   - [stake](#stake)
   - [redeem](#redeem)
   - [cooldown](#cooldown)
   - [claimRewards](#claimRewards)
4. [Governance V2](#governancev2)
   - [Governance](#governance)
     - [create](#create)
     - [cancel](#cancel)
     - [queue](#queue)
     - [execute](#execute)
     - [submitVote](#submitVote)
   - [GovernanceDelegation](#governanceDelegation)
     - [delegate](#delegate)
     - [delegateByType](#delegateByType)
5. [Faucets](#faucets)
   - [mint](#mint)
6. [Lint](#lint)
7. [Build](#build)

# Quick Start

This package uses [ethers v5](https://github.com/ethers-io/ethers.js#readme) as peer dependency, so make sure you have installed it in your project.

## Installing

```
npm install --save @aave/protocol-js
```

## Markets and Networks

The library exports the enabled networks and markets in the Aave protocol as the enums `Network` and `Market`

```
import { Network, Market } from '@aave/protocol-js';
```

## Usage

```
import { TxBuilderV2, Network, Market } from '@aave/protocol-js

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

# Lending Pool V2

Object that contains all the necessary methods to create Aave lending pool transactions.

The return object will be a Promise array of objects of type:

```
import { EthereumTransactionTypeExtended } from '@aave-tech/protocol-js
```

having {tx, txType}

- tx: object with transaction fields.
- txType: string determining the kinds of transaction.

## deposit

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

## borrow

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

## repay

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

## withdraw

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

## swapBorrowRateMode

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

## setUsageAsCollateral

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

## liquidationCall

Users can invoke this function to liquidate an undercollateralized position.

- @param `liquidator` The ethereum address that will liquidate the position
- @param `debtReserve` The ethereum address of the principal reserve
- @param `collateralReserve` The address of the collateral to liquidated
- @param `purchaseAmount` The amount of principal that the liquidator wants to repay
- @param `liquidatedUser` The address of the borrower
- @param `receiveAToken` True if the liquidator wants to receive the aTokens, false if she wants to receive the underlying asset directly
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

## swapCollateral

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

## repayWithCollateral

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

# Governance V2

Example of how to use the governance service

```
import {
  TxBuilderV2,
  AaveGovernanceV2Interface,
  GovernanceDelegationTokenInterface,
} from '@aave-tech/protocol-js';

const httpProvider = new Web3.providers.HttpProvider(
   process.env.ETHEREUM_URL ||
   "https://kovan.infura.io/v3/<project_id>"
);
const txBuilder = new TxBuilderV2(Network.main, httpProvider);
const gov2 = txBuilder.aaveGovernanceV2Service;
const powerDelegation = txBuilder.governanceDelegationTokenService;
```

## create

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

## cancel

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

## queue

Queue the proposal (If Proposal Succeeded)

- @param `user` The ethereum address that will create the proposal
- @param `proposalId` Id of the proposal we want to queue

```
gov2.queue({
   user, // string
   proposalId, // number
})
```

## execute

Execute the proposal (If Proposal Queued)

- @param `user` The ethereum address that will create the proposal
- @param `proposalId` Id of the proposal we want to execute

```
gov2.execute({
   user, // string
   proposalId, // number
})
```

## submitVote

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

# Governance Delegation

## delegate

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

## delegateByType

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

# Faucets

To use the testnet faucets which are compatible with Aave:

```
import { TxBuilderV2, Network, Market } from '@aave/protocol-js

const httpProvider = new Web3.providers.HttpProvider(
    process.env.ETHEREUM_URL ||
      "https://kovan.infura.io/v3/<project_id>"
  );
const txBuilder = new TxBuilderV2(Network.main, httpProvider);
const faucet = txBuilder.faucetService;
```

## mint

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

# Lint

To lint we use EsLint with typescript plugins and extending Airbnb

```
npm run lint
```

# Build

To build run:

```
npm run build // builds with tsdx
npm run build:tsc // builds with tsc
```
