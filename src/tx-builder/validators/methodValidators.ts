/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Network } from '../types';
import {
  amount0OrPositiveValidator,
  amountGtThan0OrMinus1,
  amountGtThan0Validator,
  isEthAddressOrEnsValidator,
  isEthAddressValidator,
  optionalValidator,
} from './validations';
import { enabledNetworksByService } from '../config';

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
    const acceptedNetworks: Network[] = enabledNetworksByService.ltaMigrator;
    if (acceptedNetworks.indexOf(currentNetwork) === -1) {
      return [];
    }

    isEthAddressValidator(target, propertyName, arguments);

    amountGtThan0Validator(target, propertyName, arguments);

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
    const acceptedNetworks: Network[] =
      enabledNetworksByService.liquiditySwapAdapter;
    if (acceptedNetworks.indexOf(currentNetwork) === -1) {
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
    const acceptedNetworks: Network[] =
      enabledNetworksByService.repayWithCollateralAdapter;
    if (acceptedNetworks.indexOf(currentNetwork) === -1) {
      return [];
    }

    isEthAddressValidator(target, propertyName, arguments);

    amountGtThan0Validator(target, propertyName, arguments);

    amountGtThan0OrMinus1(target, propertyName, arguments);

    return method?.apply(this, arguments);
  };
}

// export function StakingValidatorOld(
//   // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
//   target: any,
//   propertyName: string,
//   descriptor: TypedPropertyDescriptor<any>
// ): any {
//   const method = descriptor.value;
//   // eslint-disable-next-line no-param-reassign
//   descriptor.value = function () {
//     const currentNetwork = this.config.network;
//     const acceptedNetworks: Network[] =
//       enabledNetworksByService.staking[this.tokenStake];
//     if (acceptedNetworks.indexOf(currentNetwork) === -1) {
//       return [];
//     }

//     const isParamOptional = optionalValidator(target, propertyName, arguments);

//     isEthAddressValidator(target, propertyName, arguments, isParamOptional);

//     amountGtThan0Validator(target, propertyName, arguments, isParamOptional);

//     return method?.apply(this, arguments);
//   };
// }

export function ClaimHelperValidator(
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
      enabledNetworksByService.claimStakingRewardsHelper;
    if (acceptedNetworks.indexOf(currentNetwork) === -1) {
      return [];
    }

    const isParamOptional = optionalValidator(target, propertyName, arguments);

    isEthAddressValidator(target, propertyName, arguments, isParamOptional);

    // amountGtThan0Validator(target, propertyName, arguments, isParamOptional);

    return method?.apply(this, arguments);
  };
}

export function StakingValidator(action: string) {
  return function (
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
        enabledNetworksByService.staking[action][this.tokenStake];
      //   enabledNetworksByService.staking[this.tokenStake];
      if (acceptedNetworks.indexOf(currentNetwork) === -1) {
        return [];
      }

      const isParamOptional = optionalValidator(
        target,
        propertyName,
        arguments
      );

      isEthAddressValidator(target, propertyName, arguments, isParamOptional);

      amountGtThan0Validator(target, propertyName, arguments, isParamOptional);

      return method?.apply(this, arguments);
    };
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
    const acceptedNetworks: Network[] = enabledNetworksByService.faucet;
    if (acceptedNetworks.indexOf(currentNetwork) === -1) {
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
    const acceptedNetworks: Network[] =
      enabledNetworksByService.aaveGovernanceV2;
    if (acceptedNetworks.indexOf(currentNetwork) === -1) {
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
    const currentNetwork = this.config.network;
    const acceptedNetworks: Network[] =
      enabledNetworksByService.aaveGovernanceV2;
    if (acceptedNetworks.indexOf(currentNetwork) === -1) {
      return [];
    }

    isEthAddressValidator(target, propertyName, arguments);
    isEthAddressOrEnsValidator(target, propertyName, arguments);
    amountGtThan0Validator(target, propertyName, arguments);
    amount0OrPositiveValidator(target, propertyName, arguments);

    return method?.apply(this, arguments);
  };
}
