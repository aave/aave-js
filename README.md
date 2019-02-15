# aave-js - Decentralized finance Javascript library

JavaScript library to connect with the APIs of the [Aave](https://aave.com) ecosystem.

Initially, the library allows you to interact with the API of the decentralized lending marketplace [ETHLend](https://ethlend.io).

&nbsp;
## Installation

### Npm

```
npm install aave-js
```

&nbsp;
## An overview of how the ETHLEND marketplace works

On the ETHLend marketplace, the user is able to be borrower or lender of crypto loans.

As a borrower, he can create a request defining the conditions of the loan, and registering it in an Ethereum smart contract.

The different loan requests stored on the Ethereum smart contracts are available for the other users to fund, acting as lenders.

Practical example:
- An user is in possesion of some amount of ERC20 tokens, like 10000 LEND, and he wants to borrow ETH using them as collateral.
- He creates a loan request, requesting the maximum allowed amount of ETH (50% Loan-to-Value ratio), placing the 10000 LEND as collateral and willing to pay a monthly interest of 1%, for a period of 4 months.
- The loan request is registered on smart contracts in the Ethereum network.
- The borrower transfers the 10000 LEND to the smart contract, to be kept there as collateral of the loan.
- A lender in possession of ETH, sees the request on the ETHLend marketplace and decides to funds it.
- He accepts the terms, and establishes himself as lender, transferring the ETH to the Ethereum smart contract.
- The Ethereum smart contract forward the funds to the borrower and the lifecycle of repayments on the loan is initiated.
- Before the end of each month, the borrower paybacks the corresponding instalment amount (the proportional part of the loan amount + interests).
- The lender is able to withdraw from the smart contract the repaid amount.
- If at some point the value of the collateral goes below 110% of the outstanding amount to repay, or if the borrower doesn't repay one instalment in time, the lender is able to withdraw partially or totally the collateral.
- After the repayment of the last instalment, the 10000 LEND stored as collateral are returned to the borrower.

Through the Marketplace object, it is possible to execute all the previous steps without interacting with the ETHLend client.

&nbsp;
## Usage of Marketplace (ETHLend API)

&nbsp;
### Get an API secret key
All the features of the API will be available after initializing the Marketplace object, using a valid API secret Key.

You can get an API secret key using directly the library as following:

```javascript
import { Marketplace } from "aave-js";

const signupParams = {
    email: "an-email@email.com",
    name: "my-name",
    password: "a-super-random-password",
    organisation: "my-team-name" // Optional
}
const marketplace = new Marketplace("");
const API_SECRET_KEY = await marketplace.utils.signup(...signupParams)
```

You can also send an HTTP POST request to **https://ethdenver-api.aave.com/auth/signup** with the body:
```
{
    "email": "an-email@email.com",
    "name": "my-name",
    "password": "a-super-random-password",
    "organisation": "my-team-name"
}
```

### General guidelines

In this early access version, the library allows to interact only with the requests in testnet version of the platform (**Kovan smart contracts**). Collateral call and default functionality is not available.

The library functions that only fetch information will return formatted plain data, for example the information of a loan request.

For the functions that modify the marketplace state (like creating a new request or funding one), the functions will return a transaction object prepare to submit using an external instance of the web3 library, with whatever necessary provider.


&nbsp;
### Initialization of Martketplace

Once you have the API secret key, you can initialize the Marketplace object with:

```javascript

import { Marketplace } from "aave-js";

const MY_API_SECRET_KEY = "A_VALID_API_SECRET_KEY";

const marketplace = new Marketplace(MY_API_SECRET_KEY);
```

### Error types
- {code: 400, message: "bad request ERROR_TEXT"}
- {code: 401, message: "invalid access token"}
- {code: 404, message: "RESOURCE_TYPE LOAN_ADDRESS doesn't exist"}
- {code: 504, message: "probably some troubles with network connection"}
- {code: 500, message: "internal server error, please contact support"}

&nbsp;
### States of the loans
During it's lifecycle, the loan request goes through the following states, that will be returned in the field **state** of the request data (marketplace.requests.getLoanData(requestAddress)).
- **Init**. Initial state of a loan request. At creation, the smart contract will verify that the ratio loan amount/collateral is correct, and the loan will remain in this state until is finished. 
- **WaitingForCollateral**. The initial conditions of the loan were valid, and the borrower needs to place the collateral.
- **Funding**. Period while the lender can fund the loan request.
- **WaitingForPayback**. The loan was funded, the borrower has received the funds, and the cycle of repayments has started.
- **Finished**. The borrower has completely repaid his loan and the collateral was forwarded to him.


&nbsp;
## Functions

### - Get the data of all the requests in the marketplace
```javascript
// First we get the Ethereum addresses of all the loan requests
const allRequestsAddresses = await marketplace.requests.getAllAddresses();

const requestsData = [];
for (const requestAddress of allRequestsAddresses) {
    const data = await marketplace.requests.getLoanData(requestAddress);
    requestsData.push(data);
}
```

&nbsp;
### - Get the request addresses by borrower ethereum address
```javascript
const borrowerAddress = "0x94D5E24B4c3cb244b9E48eB33AE6ccAD6b715456"; // The address to filter
const requestsAddressesByBorrower = await marketplace.requests.getLoansByBorrower(borrowerAddress);
```

&nbsp;
### - Get the marketplace metadata
This data will be necessary to know, for example, the symbols of the available collaterals and mediums (loan currencies) in the platform.

```javascript
const metadata = await marketplace.requests.getMetadata();

// We can see the cryptocurrencies allowed as collateral
console.log(metadata.collateral);

// ... the cryptocurrencies allowed as loan currency
console.log(metadata.mediums);

// ... and the available duration range for a loan
console.log(metadata.durationRange);
```

&nbsp;
### - Create a new loan request
First we create a loan request with the parameters we want.

```javascript
const borrowerAddress = "0x94D5E24B4c3cb244b9E48eB33AE6ccAD6b715456"; // The wallet that creates the request
const collateralAmount = 10000;
const collateralType = "LEND";
const loanCurrency = "ETH";
// We get the maximum loan amount, depending on the Loan-To-Value ratio allowed
const maxLoanAmount = await marketplace
                            .requests
                            .getMaxLoanAmountFromCollateral(
                                collateralAmount, 
                                collateralType, 
                                loanCurrency);

const loanRequestParams = {
    loanAmount: maxLoanAmount,
    moe: loanCurrency,
    collateralAmount: collateralAmount,
    collateralType: collateralType,
    mpr: 1.5,
    duration: 4
}
const tx = await marketplace.requests.create(borrowerAddress,loanRequestParams);

await web3.eth.sendTransaction(tx);
```

&nbsp;
### - Place collateral
After the creation of the loan request, as borrower we need to place the collateral in the Ethereum smart contract.

This action can be executed only if the loan request is in state **WaitingForCollateral** and if the price of the collateral price is correct.

If the collateral is an ERC20 token, we need to approve the marketplace smart contract first, as with place collateral, the smart contract tries to transfer the required collateral amount from the borrower wallet, to the loan request smart contract.

```javascript
// loanData comes from calling await marketplace.requests.getLoanData(requestAddress);
const { loanAddress, borrower, collateralType, collateralAmount, state } = loanData;

const isCollateralPriceUpdated = await marketplace.requests.isCollateralPriceUpdated(loanAddress);

if (state === "WaitingForCollateral" && isCollateralPriceUpdated) {
    const isApproved = await marketplace.utils.isTransferApproved(borrower, collateralType, collateralAmount);
    if (!isApproved) {
        const approveTx = await marketplace.utils.approveTransfer(collateralType, borrower);
        await web3.eth.sendTransaction(approveTx);
    }

    const tx = await marketplace.requests.placeCollateral(loanAddress, borrowerAddress);

    await web3.eth.sendTransaction(tx);
}
```

&nbsp;
### - Fund request
Like placing the collateral, if the loan currency is an ERC20 token, it's necessary to approve the marketplace smart contract first, as it will transfer the required loan amount from the lender wallet, to the loan request smart contract.

```javascript
const { loanAddress, moe, loanAmount } = loanData;
const lenderAddress = "0x94D5E24B4c3cb244b9E48eB33AE6ccAD6b715456"; // The wallet that funds the request

const isApproved = await marketplace.utils.isTransferApproved(lenderAddress, moe, loanAmount);
if (!isApproved) {
    const approveTx = await marketplace.utils.approveTransfer(moe, lenderAddress);
    await web3.eth.sendTransaction(approveTx);
}

const tx = marketplace.requests.fund(loanAddress, lenderAddress, loanAmount);

await web3.eth.sendTransaction(tx);
```

&nbsp;
### - Pay a request instalment
```javascript
const { loanAddress, borrower, moe, nextInstalmentAmount } = loanData;

const isApproved = await marketplace.utils.isTransferApproved(borrower, moe, nextInstalmentAmount);
if (!isApproved) {
    const approveTx = await marketplace.utils.approveTransfer(moe, borrower);
    await web3.eth.sendTransaction(approveTx);
}

const tx = marketplace.requests.payback(loanAddress, borrower);

await web3.eth.sendTransaction(tx);
```

&nbsp;
### - Refresh collateral of a request
If the collateral of a request is not placed within 30 minutes after the creation, it's gonna be necessary to update the collateral price.

```javascript
const { loanAddress } = loanData;

const await.marketplace.requests.refreshCollateralPrice(loanAddress);
```


## LICENSE 

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
