pragma solidity ^0.6.8;

interface ISynthetix {
    function transferableSynthetix(address account) external view returns (uint transferable);
}
