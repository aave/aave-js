import { LoanAPIInstanceBase, LoanMetadata } from "../types";
import BaseService from "./BaseService";
import { Transaction } from "web3/eth/types";


export default class BaseLoanService extends BaseService implements LoanAPIInstanceBase {

    public constructor(serviceUrlRoot: string, token: string, apiUrl? : string){
        super(serviceUrlRoot, token, apiUrl);
    }
    
    public async payback(loanAddress: string, borrowerAddress: string): Promise<Transaction> {
        BaseService.checkAddressChecksum(loanAddress)
        BaseService.checkAddressChecksum(borrowerAddress)

        return await this.apiRequest(
            `/payback/${loanAddress}/${borrowerAddress}`,
            'placing offer requests payback',
            loanAddress,
            'post'
        )
    }

    public async isCollateralPriceUpdated(loanAddress: string): Promise<boolean> {
        return await this.apiRequest(
            `/iscollateralpriceupdated/${loanAddress}`,
            'check if the collateral price is up to date',
            loanAddress
        )
    }

    public async refreshCollateralPrice(loanAddress: string, walletAddress: string): Promise<Transaction> {
        return await this.apiRequest(
            '/refreshcollateralprice',
            'update collateral price',
            loanAddress,
            'post',
            { loanAddress, caller: walletAddress }
        )
    }


    public async getAllAddresses(): Promise<string[]> {
        return await this.apiRequest('', 'loan offer addresses')
    }



    public async getLoansByBorrower(borrowerAddress: string): Promise<string[]> {
        BaseService.checkAddressChecksum(borrowerAddress)

        return await this.apiRequest(
            `/getlistbyborrower/${borrowerAddress}`,
            'loan offer addresses by borrower',
            borrowerAddress
        )
    }

    public async getLoansByLender(lenderAddress: string): Promise<string[]> {
        BaseService.checkAddressChecksum(lenderAddress)

        return await this.apiRequest(`/getlistbylender/${lenderAddress}`, 'loan offer addresses by lender', lenderAddress)
    }


    public async getMetadata(): Promise<LoanMetadata> {
        return await this.apiRequest('/metadata', 'loan offers metadata')
    }

    public async partialCallDefault(loanAddress: string, lender: string): Promise<Transaction> {
        BaseService.checkAddressChecksum(loanAddress)
        BaseService.checkAddressChecksum(lender)

        return await this.apiRequest(
            `/calldefault/${loanAddress}/${lender}`,
            'Default call on loan',
            loanAddress,
            'post'
        )
    }

    public async callCollateral(loanAddress: string, lender: string): Promise<Transaction> {
        BaseService.checkAddressChecksum(loanAddress)
        BaseService.checkAddressChecksum(lender)

        return await this.apiRequest(
            `/callcollateral/${loanAddress}/${lender}`,
            'Default call on loan',
            loanAddress,
            'post'
        )
    }

    public async withdrawPartialDefaultAmount(loanAddress: string, lender: string): Promise<Transaction> {
        BaseService.checkAddressChecksum(loanAddress)
        BaseService.checkAddressChecksum(lender)

        return await this.apiRequest(
            `/withdrawpartialdefaultamount/${loanAddress}/${lender}`,
            'Withdraw defaulted amount on loan',
            loanAddress,
            'post'
        )
    }

}