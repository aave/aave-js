// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

interface IRepayWithCollateral {
  struct PermitSignature {
    uint256 amount;
    uint256 deadline;
    uint8 v;
    bytes32 r;
    bytes32 s;
  }

  function swapAndRepay(
    address collateralAsset,
    address debtAsset,
    uint256 collateralAmount,
    uint256 debtRepayAmount,
    uint256 debtRateMode,
    PermitSignature calldata permitSignature,
    bool useEthPath
  ) external;
}