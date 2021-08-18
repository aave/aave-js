/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Network } from '../types';
import {
  amount0OrPositiveValidator,
  amountGtThan0OrMinus1,
  amountGtThan0Validator,
  // isEthAddressArrayValidator,
  isEthAddressOrEnsValidator,
  isEthAddressValidator,
  optionalValidator,
} from './validations';
// import { enabledNetworksByService } from '../config';
import { utils } from 'ethers';

export function LPValidator(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  target: any,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<any>
): any {
  const method = descriptor.value;
  // eslint-disable-next-line no-param-reassign
  descriptor.value = function () {
    const currentNetwork = this.config.network;
    const acceptedNetworks: Network[] =
      enabledNetworksByService.lendingPool[this.market];
    if (acceptedNetworks.indexOf(currentNetwork) === -1) {
      return [];
    }

    isEthAddressValidator(target, propertyName, arguments);

    amountGtThan0Validator(target, propertyName, arguments);

    amountGtThan0OrMinus1(target, propertyName, arguments);

    return method?.apply(this, arguments);
  };
}

export function LTAMigratorValidator(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  target: any,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<any>
): any {
  const method = descriptor.value;
  // eslint-disable-next-line no-param-reassign
  descriptor.value = function () {
    const currentNetwork = this.config.network;

    const { LEND_TO_AAVE_MIGRATOR } = this.migratorConfig[currentNetwork];

    if (!utils.isAddress(LEND_TO_AAVE_MIGRATOR)) {
      console.error(`[MigratorValidator] You need to pass valid addresses`);
      return [];
    }

    isEthAddressValidator(target, propertyName, arguments);

    amountGtThan0Validator(target, propertyName, arguments);

    return method?.apply(this, arguments);
  };
}

export function IncentivesValidator(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  target: any,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<any>
): any {
  const method = descriptor.value;
  // eslint-disable-next-line no-param-reassign
  descriptor.value = function () {
    const currentNetwork = this.config.network;

    const { INCENTIVES_CONTROLLER, INCENTIVES_CONTROLLER_REWARD_TOKEN } =
      this.incentivesConfig[currentNetwork];

    if (
      !utils.isAddress(INCENTIVES_CONTROLLER_REWARD_TOKEN) ||
      !utils.isAddress(INCENTIVES_CONTROLLER)
    ) {
      console.error(`[IncentivesValidator] You need to pass valid addresses`);
      return [];
    }

    isEthAddressValidator(target, propertyName, arguments);

    // isEthAddressArrayValidator(target, propertyName, arguments);

    return method?.apply(this, arguments);
  };
}

export function LiquiditySwapValidator(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  target: any,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<any>
): any {
  const method = descriptor.value;
  // eslint-disable-next-line no-param-reassign
  descriptor.value = function () {
    const currentNetwork = this.config.network;

    const { SWAP_COLLATERAL_ADAPTER } =
      this.swapCollateralConfig[currentNetwork];

    if (!utils.isAddress(SWAP_COLLATERAL_ADAPTER)) {
      console.error(
        `[LiquiditySwapValidator] You need to pass valid addresses`
      );
      return [];
    }

    isEthAddressValidator(target, propertyName, arguments);

    amountGtThan0Validator(target, propertyName, arguments);

    amountGtThan0OrMinus1(target, propertyName, arguments);

    return method?.apply(this, arguments);
  };
}

export function RepayWithCollateralValidator(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  target: any,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<any>
): any {
  const method = descriptor.value;
  // eslint-disable-next-line no-param-reassign
  descriptor.value = function () {
    const currentNetwork = this.config.network;

    const { REPAY_WITH_COLLATERAL_ADAPTER } =
      this.repayWithCollateralConfig[currentNetwork];

    if (!utils.isAddress(REPAY_WITH_COLLATERAL_ADAPTER)) {
      console.error(
        `[RepayWithCollateralValidator] You need to pass valid addresses`
      );
      return [];
    }

    isEthAddressValidator(target, propertyName, arguments);

    amountGtThan0Validator(target, propertyName, arguments);

    amountGtThan0OrMinus1(target, propertyName, arguments);

    return method?.apply(this, arguments);
  };
}

export function StakingValidator(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  target: any,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<any>
): any {
  const method = descriptor.value;
  // eslint-disable-next-line no-param-reassign
  descriptor.value = function () {
    const currentNetwork = this.config.network;

    // No need to check if addresses exist for network
    // because this is checked at initialization and type checking of config
    const {
      TOKEN_STAKING_ADDRESS,
      STAKING_REWARD_TOKEN_ADDRESS,
      STAKING_HELPER_ADDRESS,
    } = this.stakingConfig[currentNetwork];

    // Check if addresses are valid.
    if (
      !utils.isAddress(TOKEN_STAKING_ADDRESS) ||
      !utils.isAddress(STAKING_REWARD_TOKEN_ADDRESS) ||
      (STAKING_HELPER_ADDRESS && !utils.isAddress(TOKEN_STAKING_ADDRESS))
    ) {
      console.error(`[StakingValidator] You need to pass valid addresses`);
      return [];
    }

    const isParamOptional = optionalValidator(target, propertyName, arguments);

    isEthAddressValidator(target, propertyName, arguments, isParamOptional);

    amountGtThan0Validator(target, propertyName, arguments, isParamOptional);

    return method?.apply(this, arguments);
  };
}

export function FaucetValidator(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  target: any,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<any>
): any {
  const method = descriptor.value;
  // eslint-disable-next-line no-param-reassign
  descriptor.value = function () {
    const currentNetwork = this.config.network;

    const { FAUCET } = this.faucetConfig.faucet[currentNetwork];

    if (!utils.isAddress(FAUCET)) {
      console.error(`[FaucetValidator] You need to pass valid addresses`);
      return [];
    }

    const isParamOptional = optionalValidator(target, propertyName, arguments);

    isEthAddressValidator(target, propertyName, arguments, isParamOptional);

    amountGtThan0Validator(target, propertyName, arguments, isParamOptional);

    return method?.apply(this, arguments);
  };
}

export function WETHValidator(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  target: any,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<any>
): any {
  const method = descriptor.value;
  // eslint-disable-next-line no-param-reassign
  descriptor.value = function () {
    const currentNetwork = this.config.network;
    const acceptedNetworks: Network[] = enabledNetworksByService.wethGateway;
    if (acceptedNetworks.indexOf(currentNetwork) === -1) {
      return [];
    }

    isEthAddressValidator(target, propertyName, arguments);

    amountGtThan0Validator(target, propertyName, arguments);

    amountGtThan0OrMinus1(target, propertyName, arguments);

    return method?.apply(this, arguments);
  };
}

export function GovValidator(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  target: any,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<any>
): any {
  const method = descriptor.value;
  // eslint-disable-next-line no-param-reassign
  descriptor.value = function () {
    const currentNetwork = this.config.network;

    const {
      AAVE_GOVERNANCE_V2,
      AAVE_GOVERNANCE_V2_HELPER,
      AAVE_GOVERNANCE_V2_EXECUTOR_SHORT,
      AAVE_GOVERNANCE_V2_EXECUTOR_LONG,
    } = this.governanceConfig[currentNetwork];

    if (
      !utils.isAddress(AAVE_GOVERNANCE_V2) ||
      !utils.isAddress(AAVE_GOVERNANCE_V2_HELPER) ||
      !utils.isAddress(AAVE_GOVERNANCE_V2_EXECUTOR_SHORT) ||
      !utils.isAddress(AAVE_GOVERNANCE_V2_EXECUTOR_LONG)
    ) {
      console.error(`[GovernanceValidator] You need to pass valid addresses`);
      return [];
    }

    isEthAddressValidator(target, propertyName, arguments);

    amount0OrPositiveValidator(target, propertyName, arguments);

    return method?.apply(this, arguments);
  };
}

export function GovDelegationValidator(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  target: any,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<any>
): any {
  const method = descriptor.value;
  // eslint-disable-next-line no-param-reassign
  descriptor.value = function () {
    isEthAddressValidator(target, propertyName, arguments);
    isEthAddressOrEnsValidator(target, propertyName, arguments);
    amountGtThan0Validator(target, propertyName, arguments);
    amount0OrPositiveValidator(target, propertyName, arguments);

    return method?.apply(this, arguments);
  };
}
