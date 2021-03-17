pragma solidity ^0.6.8;

interface IClaimStakingRewardsHelper {
  function claimAllRewards(address to) external returns (uint256);

  function claimAllRewardsAndStake(address to) external;

  function claimAndStake(address to, address stakeToken) external;
}
