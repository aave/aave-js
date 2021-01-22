// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.7.5;
pragma abicoder v2;

interface IGovernanceStrategy {
  /**
   * @dev Returns the Proposition Power of a user at a specific block number.
   * @param user Address of the user.
   * @param blockNumber Blocknumber at which to fetch Proposition Power
   * @return Power number
   **/
  function getPropositionPowerAt(address user, uint256 blockNumber) external view returns (uint256);

  /**
   * @dev Returns the total supply of Outstanding Proposition Tokens
   * @param blockNumber Blocknumber at which to evaluate
   * @return total supply at blockNumber
   **/
  function getTotalPropositionSupplyAt(uint256 blockNumber) external view returns (uint256);

  /**
   * @dev Returns the total supply of Outstanding Voting Tokens
   * @param blockNumber Blocknumber at which to evaluate
   * @return total supply at blockNumber
   **/
  function getTotalVotingSupplyAt(uint256 blockNumber) external view returns (uint256);

  /**
   * @dev Returns the Vote Power of a user at a specific block number.
   * @param user Address of the user.
   * @param blockNumber Blocknumber at which to fetch Vote Power
   * @return Vote number
   **/
  function getVotingPowerAt(address user, uint256 blockNumber) external view returns (uint256);

  /**
   * @dev Get the AAVE address of strategy
   * @return address
   **/
  function AAVE() external view returns (address);

  /**
   * @dev Get the Staked AAVE address of strategy
   * @return address
   **/
  function STK_AAVE() external view returns (address);
}
