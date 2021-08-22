/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface IStakedTokenInterface extends ethers.utils.Interface {
  functions: {
    "REWARD_TOKEN()": FunctionFragment;
    "STAKED_TOKEN()": FunctionFragment;
    "claimRewards(address,uint256)": FunctionFragment;
    "claimRewardsAndRedeem(address,uint256,uint256)": FunctionFragment;
    "cooldown()": FunctionFragment;
    "redeem(address,uint256)": FunctionFragment;
    "stake(address,uint256)": FunctionFragment;
    "stakeWithPermit(address,address,uint256,uint256,uint8,bytes32,bytes32)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "REWARD_TOKEN",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "STAKED_TOKEN",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "claimRewards",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "claimRewardsAndRedeem",
    values: [string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "cooldown", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "redeem",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "stake",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "stakeWithPermit",
    values: [
      string,
      string,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BytesLike,
      BytesLike
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "REWARD_TOKEN",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "STAKED_TOKEN",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "claimRewards",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "claimRewardsAndRedeem",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "cooldown", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "redeem", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "stake", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "stakeWithPermit",
    data: BytesLike
  ): Result;

  events: {};
}

export class IStakedToken extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: IStakedTokenInterface;

  functions: {
    REWARD_TOKEN(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "REWARD_TOKEN()"(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    STAKED_TOKEN(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "STAKED_TOKEN()"(
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    claimRewards(
      to: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "claimRewards(address,uint256)"(
      to: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    claimRewardsAndRedeem(
      to: string,
      claimAmount: BigNumberish,
      redeemAmount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "claimRewardsAndRedeem(address,uint256,uint256)"(
      to: string,
      claimAmount: BigNumberish,
      redeemAmount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    cooldown(overrides?: Overrides): Promise<ContractTransaction>;

    "cooldown()"(overrides?: Overrides): Promise<ContractTransaction>;

    redeem(
      to: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "redeem(address,uint256)"(
      to: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    stake(
      onBehalfOf: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "stake(address,uint256)"(
      onBehalfOf: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    stakeWithPermit(
      from: string,
      to: string,
      amount: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "stakeWithPermit(address,address,uint256,uint256,uint8,bytes32,bytes32)"(
      from: string,
      to: string,
      amount: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  REWARD_TOKEN(overrides?: CallOverrides): Promise<string>;

  "REWARD_TOKEN()"(overrides?: CallOverrides): Promise<string>;

  STAKED_TOKEN(overrides?: CallOverrides): Promise<string>;

  "STAKED_TOKEN()"(overrides?: CallOverrides): Promise<string>;

  claimRewards(
    to: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "claimRewards(address,uint256)"(
    to: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  claimRewardsAndRedeem(
    to: string,
    claimAmount: BigNumberish,
    redeemAmount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "claimRewardsAndRedeem(address,uint256,uint256)"(
    to: string,
    claimAmount: BigNumberish,
    redeemAmount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  cooldown(overrides?: Overrides): Promise<ContractTransaction>;

  "cooldown()"(overrides?: Overrides): Promise<ContractTransaction>;

  redeem(
    to: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "redeem(address,uint256)"(
    to: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  stake(
    onBehalfOf: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "stake(address,uint256)"(
    onBehalfOf: string,
    amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  stakeWithPermit(
    from: string,
    to: string,
    amount: BigNumberish,
    deadline: BigNumberish,
    v: BigNumberish,
    r: BytesLike,
    s: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "stakeWithPermit(address,address,uint256,uint256,uint8,bytes32,bytes32)"(
    from: string,
    to: string,
    amount: BigNumberish,
    deadline: BigNumberish,
    v: BigNumberish,
    r: BytesLike,
    s: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    REWARD_TOKEN(overrides?: CallOverrides): Promise<string>;

    "REWARD_TOKEN()"(overrides?: CallOverrides): Promise<string>;

    STAKED_TOKEN(overrides?: CallOverrides): Promise<string>;

    "STAKED_TOKEN()"(overrides?: CallOverrides): Promise<string>;

    claimRewards(
      to: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "claimRewards(address,uint256)"(
      to: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    claimRewardsAndRedeem(
      to: string,
      claimAmount: BigNumberish,
      redeemAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "claimRewardsAndRedeem(address,uint256,uint256)"(
      to: string,
      claimAmount: BigNumberish,
      redeemAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    cooldown(overrides?: CallOverrides): Promise<void>;

    "cooldown()"(overrides?: CallOverrides): Promise<void>;

    redeem(
      to: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "redeem(address,uint256)"(
      to: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    stake(
      onBehalfOf: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "stake(address,uint256)"(
      onBehalfOf: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    stakeWithPermit(
      from: string,
      to: string,
      amount: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    "stakeWithPermit(address,address,uint256,uint256,uint8,bytes32,bytes32)"(
      from: string,
      to: string,
      amount: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    REWARD_TOKEN(overrides?: CallOverrides): Promise<BigNumber>;

    "REWARD_TOKEN()"(overrides?: CallOverrides): Promise<BigNumber>;

    STAKED_TOKEN(overrides?: CallOverrides): Promise<BigNumber>;

    "STAKED_TOKEN()"(overrides?: CallOverrides): Promise<BigNumber>;

    claimRewards(
      to: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "claimRewards(address,uint256)"(
      to: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    claimRewardsAndRedeem(
      to: string,
      claimAmount: BigNumberish,
      redeemAmount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "claimRewardsAndRedeem(address,uint256,uint256)"(
      to: string,
      claimAmount: BigNumberish,
      redeemAmount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    cooldown(overrides?: Overrides): Promise<BigNumber>;

    "cooldown()"(overrides?: Overrides): Promise<BigNumber>;

    redeem(
      to: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "redeem(address,uint256)"(
      to: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    stake(
      onBehalfOf: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "stake(address,uint256)"(
      onBehalfOf: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    stakeWithPermit(
      from: string,
      to: string,
      amount: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "stakeWithPermit(address,address,uint256,uint256,uint8,bytes32,bytes32)"(
      from: string,
      to: string,
      amount: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    REWARD_TOKEN(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "REWARD_TOKEN()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    STAKED_TOKEN(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "STAKED_TOKEN()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    claimRewards(
      to: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "claimRewards(address,uint256)"(
      to: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    claimRewardsAndRedeem(
      to: string,
      claimAmount: BigNumberish,
      redeemAmount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "claimRewardsAndRedeem(address,uint256,uint256)"(
      to: string,
      claimAmount: BigNumberish,
      redeemAmount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    cooldown(overrides?: Overrides): Promise<PopulatedTransaction>;

    "cooldown()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    redeem(
      to: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "redeem(address,uint256)"(
      to: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    stake(
      onBehalfOf: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "stake(address,uint256)"(
      onBehalfOf: string,
      amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    stakeWithPermit(
      from: string,
      to: string,
      amount: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "stakeWithPermit(address,address,uint256,uint256,uint8,bytes32,bytes32)"(
      from: string,
      to: string,
      amount: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}
