# aave-js - Decentralized finance Javascript library

JavaScript library to connect with the APIs of the [Aave](https://aave.com) ecosystem.

Initially, the library allows you to interact with the API of the decentralized lending marketplace [ETHLend](https://ethlend.io).

&nbsp;
## Installation

### Npm

```bash
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
```json
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
## Loan Request Functions

&nbsp;
### - Create a new loan request
First we create a loan request with the parameters we want.

```javascript
const borrowerAddress = "0x94D5E24B4c3cb244b9E48eB33AE6ccAD6b715456"; // The wallet that creates the request
const collateralAmount = 10000;
const collateralType = "LEND";
const loanCurrency = "ETH";
// We get the maximum loan amount, depending on the Loan-To-Value ratio allowed
const maxLoanAmount = await marketplace.requests.getMaxLoanAmountFromCollateral(
  collateralAmount, collateralType, loanCurrency
);

const loanRequestParams = {
    loanAmount: maxLoanAmount,
    moe: loanCurrency,
    collateralAmount: collateralAmount,
    collateralType: collateralType,
    mpr: 1.5,
    duration: 4
};
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
    const isApproved = await marketplace.utils.isTransferApproved(
      borrower, collateralType, collateralAmount
    );
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
## Loan Offer Functions

&nbsp;
### - Create a new loan offer
Create a new loan offer with the specific parameters.

```javascript
const lenderAddress = "0x94D5E24B4c3cb244b9E48eB33AE6ccAD6b715456"; // The wallet that creates the request
const minimumLoanAmount = 1000;
const maximumLoanAmount = 10000;
const collaterals = {id: 0, symbol: "LEND", mpr: 0.25, ltv: 50, valid: true};
const durationRange = {min: 1, max: 12};

const loanOfferParams = {
    minimumLoanAmount,
    maximumLoanAmount,
    moe: "LEND",
    collaterals,
    durationRange
    
};

const tx = await marketplace.offers.create(lenderAddress,loanOfferParams);

await web3.eth.sendTransaction(tx);
```

&nbsp;
### - Take a loan offer

```javascript
const borrowerAddress = "0x94D5E24B4c3cb244b9E48eB33AE6ccAD6b715456"; // The wallet that creates the request

// borrower params need to be in the range of params specified for the particular loan offer the borrower wants to take. this is enforced at smart contracts level

const loanAmount = 1000; //needs to be between maximumLoanAmount and minimumLoanAmount specified in the offer
const loanCurrency = "ETH";  //same currency as the offer
const collateralType = "LEND";  //needs to be in the list of the specified collaterals
const collateralAmount = await marketplace.utils.getCollateralFromLoanAmount(loanAmount, collateralType, loanCurrency);

const borrowerParams = {

    loanAmount, 
    moe: loanCurrency,
    collateralAmount, 
    collateralType,
    duration: 4 //needs to be in the duration range of the offer
};

const tx = await marketplace.offers.takeLoanOffer(borrowerAddress,borrowerParams);

await web3.eth.sendTransaction(tx);
```

## Generic Methods
These methods are available on both the ``` offers ``` and ``` requests``` objects. Here we will use the ``` requests ``` object as reference.

### - Get all requests addresses in the marketplace
```javascript
const allRequestsAddresses = await marketplace.requests.getAllAddresses();
```

&nbsp;
### - Get the data of all the requests in the marketplace
```javascript
const requestsData = await marketplace.requests.getDataAllLoans();
```

&nbsp;
### - Get the data of a loan request by ethereum address
```javascript
const loanRequestAddress = "0x94D5E24B4c3cb244b9E48eB33AE6ccAD6b715456";
const loanRequestData = await marketplace.requests.getLoanData(loanRequestAddress);
```

&nbsp;
### - Get the data of all requests by borrower ethereum address
```javascript
const borrowerAddress = "0x94D5E24B4c3cb244b9E48eB33AE6ccAD6b715456";
const requestsAddressesByBorrower = await marketplace.requests.getDataAllLoansByBorrower(borrowerAddress);
```

&nbsp;
### - Get the data of all requests by lender ethereum address
```javascript
const lenderAddress = "0x94D5E24B4c3cb244b9E48eB33AE6ccAD6b715456";
const requestsAddressesByLender = await marketplace.requests.getDataAllLoansByLender(lenderAddress);
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

await.marketplace.requests.refreshCollateralPrice(loanAddress);
```

&nbsp;
### - Execute partial default call on a loan
In the event of a borrower not paying back the loan installments, the lender has the possibility of executing what we call a partial default call. This means he can automatically withdraw a portion of the collateral equivalent to the amount of installments that the borrower has not paid back. If the partial default call includes the last installment, the remaining collateral is automatically sent back to the borrower and the loan relationship is concluded.

```javascript
const { loanAddress } = loanData;
const lenderAddress =  ... // fetch from web3

// lender address must be a valid lender for the loan. The requirement is enforced at a smart contract level
const tx = marketplace.requests.partialCallDefault(loanAddress, lenderAddress);

await web3.eth.sendTransaction(tx);
```

&nbsp;
### - Withdraw partial defaulted amount by a lender
If the partial defaulted loan is a crowdlending loan (it means it can be funded by multiple people) other lenders partecipating in the loan will be able to withdraw their part of the collateral, proportional to the amount the borrower didn't pay and the amount the specific lender funded in the loan. The lender(s) executing this action must be different from the lender that first called the partialCallDefault().

```javascript
const { loanAddress } = loanData;
const lenderAddress =  ... // fetch from web3

// lender address must be a valid lender for the loan, and a different lender than the one that performed the partialCallDefault(). The requirement is enforced at a smart contract level
const tx = marketplace.requests.withdrawPartialDefaultAmount(loanAddress, lenderAddress);

await web3.eth.sendTransaction(tx);
```

&nbsp;
### - Execute collateral call on a loan
In the event of the collateral value dropping below 110% of the loan amount value, the lender can perform a collateral call. The lender will receive the collateral at a 5% discount on price and he will have the freedom to liquidate. After a collateral call event, the loan relationship is concluded.

```javascript
const { loanAddress } = loanData;
const lenderAddress =  ... // fetch from web3

// lender address must be a valid lender for the loan. The requirement is enforced at a smart contract level
const tx = marketplace.requests.callCollateral(loanAddress, lenderAddress);

await web3.eth.sendTransaction(tx);
```



## LICENSE 

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
