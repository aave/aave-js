pragma solidity ^0.6.8;

interface IClaimStakingRewardsHelper {
    function claimAllRewards(address to, uint256 amount) external;

    function claimAllRewardsAndStake(address to, uint256 amount) external;
}
