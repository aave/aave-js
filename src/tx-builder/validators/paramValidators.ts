/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

export const isEthAddressMetadataKey = Symbol('ethAddress');
export const isEthAddressArrayMetadataKey = Symbol('ethAddressArray');
export const isEthAddressOrENSMetadataKey = Symbol('ethOrENSAddress');
export const isPositiveMetadataKey = Symbol('isPositive');
export const isPositiveOrMinusOneMetadataKey = Symbol('isPositiveOrMinusOne');
export const is0OrPositiveMetadataKey = Symbol('is0OrPositiveMetadataKey');
export const optionalMetadataKey = Symbol('Optional');

export type paramsType = {
  index: number;
  field: string | undefined;
};

// tslint:disable-next-line: function-name
export function IsEthAddress(field?: string) {
  return function (
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number
  ): void {
    const existingPossibleAddresses: paramsType[] =
      Reflect.getOwnMetadata(isEthAddressMetadataKey, target, propertyKey) ||
      [];

    existingPossibleAddresses.push({
      index: parameterIndex,
      field,
    });

    Reflect.defineMetadata(
      isEthAddressMetadataKey,
      existingPossibleAddresses,
      target,
      propertyKey
    );
  };
}

// tslint:disable-next-line: function-name
export function IsEthAddressArray(field?: string) {
  return function (
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number
  ): void {
    const existingPossibleAddresses: paramsType[] =
      Reflect.getOwnMetadata(isEthAddressMetadataKey, target, propertyKey) ||
      [];

    existingPossibleAddresses.push({
      index: parameterIndex,
      field,
    });

    Reflect.defineMetadata(
      isEthAddressArrayMetadataKey,
      existingPossibleAddresses,
      target,
      propertyKey
    );
  };
}

export function IsEthAddressOrENS(field?: string) {
  return function (
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number
  ): void {
    const existingPossibleAddresses: paramsType[] =
      Reflect.getOwnMetadata(
        isEthAddressOrENSMetadataKey,
        target,
        propertyKey
      ) || [];

    existingPossibleAddresses.push({
      index: parameterIndex,
      field,
    });

    Reflect.defineMetadata(
      isEthAddressOrENSMetadataKey,
      existingPossibleAddresses,
      target,
      propertyKey
    );
  };
}

export function IsPositiveAmount(field?: string) {
  return function (
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number
  ): void {
    const params: paramsType[] =
      Reflect.getOwnMetadata(isPositiveMetadataKey, target, propertyKey) || [];

    params.push({ index: parameterIndex, field });

    Reflect.defineMetadata(isPositiveMetadataKey, params, target, propertyKey);
  };
}

export function Is0OrPositiveAmount(field?: string) {
  return function (
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number
  ): void {
    const params: paramsType[] =
      Reflect.getOwnMetadata(is0OrPositiveMetadataKey, target, propertyKey) ||
      [];

    params.push({ index: parameterIndex, field });

    Reflect.defineMetadata(
      is0OrPositiveMetadataKey,
      params,
      target,
      propertyKey
    );
  };
}

export function IsPositiveOrMinusOneAmount(field?: string) {
  return function (
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number
  ): void {
    const params: paramsType[] =
      Reflect.getOwnMetadata(
        isPositiveOrMinusOneMetadataKey,
        target,
        propertyKey
      ) || [];

    params.push({ index: parameterIndex, field });

    Reflect.defineMetadata(
      isPositiveOrMinusOneMetadataKey,
      params,
      target,
      propertyKey
    );
  };
}

export function Optional(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number
): void {
  const existingOptionalParameters =
    Reflect.getOwnMetadata(optionalMetadataKey, target, propertyKey) || [];
  existingOptionalParameters.push(parameterIndex);
  Reflect.defineMetadata(
    optionalMetadataKey,
    existingOptionalParameters,
    target,
    propertyKey
  );
}
