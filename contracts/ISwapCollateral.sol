// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

interface ISwapCollateral {
  struct PermitSignature {
    uint256 amount;
    uint256 deadline;
    uint8 v;
    bytes32 r;
    bytes32 s;
  }

  function swapAndDeposit(
    address[] calldata assetToSwapFromList,
    address[] calldata assetToSwapToList,
    uint256[] calldata amountToSwapList,
    uint256[] calldata minAmountsToReceive,
    PermitSignature[] calldata permitParams,
    bool[] calldata useEthPath
  ) external;
}