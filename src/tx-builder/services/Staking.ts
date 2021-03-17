import { constants, utils, Signature } from 'ethers';
import IERC20ServiceInterface from '../interfaces/ERC20';
import {
  DEFAULT_APPROVE_AMOUNT,
  distinctStakingAddressesBetweenTokens,
  MAX_UINT_AMOUNT,
} from '../config';
import { IStakedToken, IStakedToken__factory } from '../contract-types';
import StakingInterface from '../interfaces/Staking';
import {
  ChainId,
  Configuration,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  Stake,
  StakeActions,
  tEthereumAddress,
  transactionType,
  tStringCurrencyUnits,
  tStringDecimalUnits,
} from '../types';
import { parseNumber } from '../utils/parsings';
import { StakingValidator } from '../validators/methodValidators';
import {
  IsEthAddress,
  IsPositiveAmount,
  IsPositiveOrMinusOneAmount,
  Optional,
} from '../validators/paramValidators';
import BaseService from './BaseService';
import { ClaimStakingRewardsHelperInterface } from './ClaimStakingRewardsHelper';

export default class StakingService
  extends BaseService<IStakedToken>
  implements StakingInterface {
  readonly stakingContractAddress: string;

  readonly erc20Service: IERC20ServiceInterface;

  readonly claimStakingRewardsHelperService: ClaimStakingRewardsHelperInterface;

  readonly tokenStake: Stake;

  constructor(
    config: Configuration,
    erc20Service: IERC20ServiceInterface,
    claimStakingRewardsHelperService: ClaimStakingRewardsHelperInterface,
    tokenStake: Stake
  ) {
    super(config, IStakedToken__factory);
    this.tokenStake = tokenStake;
    this.erc20Service = erc20Service;
    this.claimStakingRewardsHelperService = claimStakingRewardsHelperService;

    const { network } = this.config;

    const { TOKEN_STAKING_ADDRESS } = distinctStakingAddressesBetweenTokens[
      this.tokenStake
    ][network];

    this.stakingContractAddress = TOKEN_STAKING_ADDRESS;
  }

  @StakingValidator(StakeActions.signStaking)
  public async signStaking(
    @IsEthAddress() user: tEthereumAddress,
    @IsPositiveAmount() amount: tStringCurrencyUnits,
    nonce: string
  ): Promise<string> {
    const { getTokenData } = this.erc20Service;
    const stakingContract: IStakedToken = this.getContractInstance(
      this.stakingContractAddress
    );
    const stakedToken: string = await stakingContract.STAKED_TOKEN();
    const { name, decimals } = await getTokenData(stakedToken);
    const convertedAmount: tStringDecimalUnits = parseNumber(amount, decimals);

    const typeData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      primaryType: 'Permit' as const,
      domain: {
        name,
        version: '1',
        chainId: ChainId[this.config.network],
        verifyingContract: stakedToken,
      },
      message: {
        owner: user,
        spender: this.stakingContractAddress,
        value: convertedAmount,
        nonce,
        deadline: constants.MaxUint256.toString(),
      },
    };

    return JSON.stringify(typeData);
  }

  @StakingValidator(StakeActions.stakeWithPermit)
  public async stakeWithPermit(
    @IsEthAddress() user: tEthereumAddress,
    @IsPositiveAmount() amount: tStringCurrencyUnits,
    signature: string
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];
    const { decimalsOf } = this.erc20Service;
    const stakingContract: IStakedToken = this.getContractInstance(
      this.stakingContractAddress
    );
    const stakedToken: string = await stakingContract.STAKED_TOKEN();
    const stakedTokenDecimals: number = await decimalsOf(stakedToken);
    const convertedAmount: tStringDecimalUnits = parseNumber(
      amount,
      stakedTokenDecimals
    );
    const sig: Signature = utils.splitSignature(signature);
    const deadline = constants.MaxUint256.toString();

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        stakingContract.populateTransaction.stakeWithPermit(
          user,
          this.stakingContractAddress,
          convertedAmount,
          deadline,
          sig.v,
          sig.r,
          sig.s
        ),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.STAKE_ACTION,
      gas: this.generateTxPriceEstimation(txs, txCallback),
    });

    return txs;
  }

  @StakingValidator(StakeActions.stake)
  public async stake(
    @IsEthAddress() user: tEthereumAddress,
    @IsPositiveAmount() amount: tStringCurrencyUnits,
    @Optional @IsEthAddress() onBehalfOf?: tEthereumAddress
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];
    const { decimalsOf, isApproved, approve } = this.erc20Service;
    const stakingContract: IStakedToken = this.getContractInstance(
      this.stakingContractAddress
    );
    const stakedToken: string = await stakingContract.STAKED_TOKEN();
    const stakedTokenDecimals: number = await decimalsOf(stakedToken);
    const convertedAmount: tStringDecimalUnits = parseNumber(
      amount,
      stakedTokenDecimals
    );
    const approved: boolean = await isApproved(
      stakedToken,
      user,
      this.stakingContractAddress,
      amount
    );
    if (!approved) {
      const approveTx = approve(
        user,
        stakedToken,
        this.stakingContractAddress,
        DEFAULT_APPROVE_AMOUNT
      );
      txs.push(approveTx);
    }

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        stakingContract.populateTransaction.stake(
          onBehalfOf || user,
          convertedAmount
        ),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.STAKE_ACTION,
      gas: this.generateTxPriceEstimation(txs, txCallback),
    });

    return txs;
  }

  @StakingValidator(StakeActions.redeem)
  public async redeem(
    @IsEthAddress() user: tEthereumAddress,
    @IsPositiveOrMinusOneAmount() amount: tStringCurrencyUnits
  ): Promise<EthereumTransactionTypeExtended[]> {
    let convertedAmount: tStringDecimalUnits;
    const stakingContract: IStakedToken = this.getContractInstance(
      this.stakingContractAddress
    );
    if (amount === '-1') {
      convertedAmount = MAX_UINT_AMOUNT;
    } else {
      const { decimalsOf } = this.erc20Service;

      const stakedToken: string = await stakingContract.STAKED_TOKEN();
      const stakedTokenDecimals: number = await decimalsOf(stakedToken);
      convertedAmount = parseNumber(amount, stakedTokenDecimals);
    }

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        stakingContract.populateTransaction.redeem(user, convertedAmount),
      from: user,
      gasSurplus: 20,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.STAKE_ACTION,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }

  @StakingValidator(StakeActions.cooldown)
  public async cooldown(
    @IsEthAddress() user: tEthereumAddress
  ): Promise<EthereumTransactionTypeExtended[]> {
    const stakingContract: IStakedToken = this.getContractInstance(
      this.stakingContractAddress
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () => stakingContract.populateTransaction.cooldown(),
      from: user,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.STAKE_ACTION,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }

  @StakingValidator(StakeActions.claimRewards)
  public async claimRewards(
    @IsEthAddress() user: tEthereumAddress,
    @IsPositiveOrMinusOneAmount() amount: tStringCurrencyUnits
  ): Promise<EthereumTransactionTypeExtended[]> {
    let convertedAmount: tStringDecimalUnits;
    const stakingContract: IStakedToken = this.getContractInstance(
      this.stakingContractAddress
    );
    if (amount === '-1') {
      convertedAmount = MAX_UINT_AMOUNT;
    } else {
      const { decimalsOf } = this.erc20Service;
      const stakedToken: string = await stakingContract.REWARD_TOKEN();
      const stakedTokenDecimals: number = await decimalsOf(stakedToken);
      convertedAmount = parseNumber(amount, stakedTokenDecimals);
    }

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        stakingContract.populateTransaction.claimRewards(user, convertedAmount),
      from: user,
      gasSurplus: 20,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.STAKE_ACTION,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }

  @StakingValidator(StakeActions.claimRewardsAndRedeem)
  public async claimRewardsAndRedeem(
    @IsEthAddress() user: tEthereumAddress,
    @IsPositiveOrMinusOneAmount() claimAmount: tStringCurrencyUnits,
    @IsPositiveOrMinusOneAmount() redeemAmount: tStringCurrencyUnits
  ): Promise<EthereumTransactionTypeExtended[]> {
    let convertedClaimAmount: tStringDecimalUnits;
    let convertedRedeemAmount: tStringDecimalUnits;
    const stakingContract: IStakedToken = this.getContractInstance(
      this.stakingContractAddress
    );
    if (claimAmount === '-1') {
      convertedClaimAmount = constants.MaxUint256.toString();
    } else {
      const { decimalsOf } = this.erc20Service;
      const stakedToken: string = await stakingContract.REWARD_TOKEN();
      const stakedTokenDecimals: number = await decimalsOf(stakedToken);
      convertedClaimAmount = parseNumber(claimAmount, stakedTokenDecimals);
    }

    if (redeemAmount === '-1') {
      convertedRedeemAmount = constants.MaxUint256.toString();
    } else {
      const { decimalsOf } = this.erc20Service;

      const stakedToken: string = await stakingContract.STAKED_TOKEN();
      const stakedTokenDecimals: number = await decimalsOf(stakedToken);
      convertedRedeemAmount = parseNumber(redeemAmount, stakedTokenDecimals);
    }

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        stakingContract.populateTransaction.claimRewardsAndRedeem(
          user,
          convertedClaimAmount,
          convertedRedeemAmount
        ),
      from: user,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.STAKE_ACTION,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }

  @StakingValidator(StakeActions.claimRewardsAndStake)
  public async claimRewardsAndStake(
    @IsEthAddress() user: tEthereumAddress
  ): Promise<EthereumTransactionTypeExtended[]> {
    return [
      this.claimStakingRewardsHelperService.claimAndStake(
        user,
        this.stakingContractAddress
      ),
    ];
  }

  @StakingValidator(StakeActions.claimAllRewards)
  public async claimAllRewards(
    @IsEthAddress() user: tEthereumAddress
  ): Promise<EthereumTransactionTypeExtended[]> {
    return [this.claimStakingRewardsHelperService.claimAllRewards(user)];
  }

  @StakingValidator(StakeActions.claimAllRewardsAndStake)
  public async claimAllRewardsAndStake(
    @IsEthAddress() user: tEthereumAddress
  ): Promise<EthereumTransactionTypeExtended[]> {
    return [
      this.claimStakingRewardsHelperService.claimAllRewardsAndStake(user),
    ];
  }
}
