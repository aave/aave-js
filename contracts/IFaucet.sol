pragma solidity ^0.6.8;

/**
 * @title Faucet
 * @notice proxy contract, with mapping token => minter contract and proxy mint() function
 * @author Aave
 **/

interface IFaucet {
  /**
   * @dev Proxy function to mint _token, calling its Minter
   * @param _token The address of the token
   * @param _token The amount to mint
   * @return The amount minted
   **/
  function mint(address _token, uint256 _amount) external payable returns (uint256);

  /**
   * @dev Returns the Minter of a _token
   * @param _token The token address
   * @return The Minter
   **/
  function getMinter(address _token) external view returns (address);
}
