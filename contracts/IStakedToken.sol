// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.8;

/**
 * @title StakedToken
 * @notice Contract to stake Aave token, tokenize the position and get rewards, inheriting from a distribution manager contract
 * @author Aave
 **/
interface IStakedToken {
  function STAKED_TOKEN() external view returns(address);

  function REWARD_TOKEN() external view returns(address);

  function stake(address onBehalfOf, uint256 amount) external;

  function redeem(address to, uint256 amount) external;

  /**
   * @dev Activates the cooldown period to unstake
   * - It can't be called if the user is not staking
   **/
  function cooldown() external;

  /**
   * @dev Claims an `amount` of `REWARD_TOKEN` to the address `to`
   * @param to Address to stake for
   * @param amount Amount to stake
   **/
  function claimRewards(address to, uint256 amount) external;
}
