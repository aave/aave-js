// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

/**
 * @title ParaSwapLiquiditySwapAdapter
 * @notice Adapter to swap liquidity using ParaSwap.
 * @author Jason Raymond Bell
 */
interface IParaSwapLiquiditySwapAdapter {
    struct PermitSignature {
        uint256 amount;
        uint256 deadline;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    /**
     * @dev Swaps an amount of an asset to another and deposits the new asset amount on behalf of the user without using a flash loan.
     * This method can be used when the temporary transfer of the collateral asset to this contract does not affect the user position.
     * The user should give this contract allowance to pull the ATokens in order to withdraw the underlying asset and perform the swap.
     * @param assetToSwapFrom Address of the underlying asset to be swapped from
     * @param assetToSwapTo Address of the underlying asset to be swapped to and deposited
     * @param amountToSwap Amount to be swapped, or maximum amount when swapping all balance
     * @param minAmountToReceive Minimum amount to be received from the swap
     * @param swapAllBalanceOffset Set to offset of fromAmount in Augustus calldata if wanting to swap all balance, otherwise 0
     * @param swapCalldata Calldata for ParaSwap's AugustusSwapper contract
     * @param augustus Address of ParaSwap's AugustusSwapper contract
     * @param permitParams Struct containing the permit signatures, set to all zeroes if not used
     */
    function swapAndDeposit(
        address assetToSwapFrom,
        address assetToSwapTo,
        uint256 amountToSwap,
        uint256 minAmountToReceive,
        uint256 swapAllBalanceOffset,
        bytes calldata swapCalldata,
        address augustus,
        PermitSignature calldata permitParams
    ) external;
}
