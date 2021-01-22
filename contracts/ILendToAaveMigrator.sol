// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.8;

/**
* @title LendToAaveMigrator
* @notice This contract implements the migration from LEND to AAVE token
* @author Aave 
*/
interface ILendToAaveMigrator {
    function LEND() external view returns(address);
    /**
    * @dev executes the migration from LEND to AAVE. Users need to give allowance to this contract to transfer LEND before executing
    * this transaction.
    * @param amount the amount of LEND to be migrated
    */
    function migrateFromLEND(uint256 amount) external;
}