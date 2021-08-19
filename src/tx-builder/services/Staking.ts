import { constants, utils, Signature } from 'ethers';
import IERC20ServiceInterface from '../interfaces/ERC20';
import { DEFAULT_APPROVE_AMOUNT, MAX_UINT_AMOUNT } from '../config';
import {
  IStakedToken,
  IAaveStakingHelper,
  IAaveStakingHelper__factory,
  IStakedToken__factory,
} from '../contract-types';
import StakingInterface from '../interfaces/Staking';
import {
  ChainId,
  Configuration,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  StakingNetworkConfig,
  tEthereumAddress,
  transactionType,
  tStringCurrencyUnits,
  tStringDecimalUnits,
} from '../types';
import { parseNumber } from '../utils/parsings';
import {
  SignStakingValidator,
  StakingValidator,
} from '../validators/methodValidators';
import {
  IsEthAddress,
  IsPositiveAmount,
  IsPositiveOrMinusOneAmount,
  Optional,
} from '../validators/paramValidators';
import BaseService from './BaseService';

export default class StakingService
  extends BaseService<IStakedToken>
  implements StakingInterface {
  readonly stakingHelperContract: IAaveStakingHelper;

  public readonly stakingContractAddress: tEthereumAddress;

  public readonly stakingRewardTokenContractAddress: tEthereumAddress;

  readonly stakingHelperContractAddress: tEthereumAddress | undefined;

  readonly erc20Service: IERC20ServiceInterface;

  readonly tokenStake: string;

  readonly stakingConfig: StakingNetworkConfig | undefined;

  constructor(
    config: Configuration,
    erc20Service: IERC20ServiceInterface,
    tokenStake: string,
    stakingConfig: StakingNetworkConfig | undefined
  ) {
    super(config, IStakedToken__factory);
    this.stakingConfig = stakingConfig;
    this.tokenStake = tokenStake;
    this.erc20Service = erc20Service;

    const { provider } = this.config;

    const { TOKEN_STAKING, STAKING_REWARD_TOKEN, STAKING_HELPER } =
      this.stakingConfig || {};

    this.stakingContractAddress = TOKEN_STAKING || '';
    this.stakingRewardTokenContractAddress = STAKING_REWARD_TOKEN || '';
    this.stakingHelperContractAddress = STAKING_HELPER;

    if (this.stakingHelperContractAddress) {
      this.stakingHelperContract = IAaveStakingHelper__factory.connect(
        this.stakingHelperContractAddress,
        provider
      );
    }
  }

  @SignStakingValidator
  public async signStaking(
    @IsEthAddress() user: tEthereumAddress,
    @IsPositiveAmount() amount: tStringCurrencyUnits,
    nonce: string
  ): Promise<string> {
    if (!this.stakingHelperContractAddress) return '';

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
        spender: this.stakingHelperContractAddress,
        value: convertedAmount,
        nonce,
        deadline: constants.MaxUint256.toString(),
      },
    };

    return JSON.stringify(typeData);
  }

  @StakingValidator
  public async stakeWithPermit(
    @IsEthAddress() user: tEthereumAddress,
    @IsPositiveAmount() amount: tStringCurrencyUnits,
    signature: string
  ): Promise<EthereumTransactionTypeExtended[]> {
    if (!this.stakingHelperContractAddress) return [];

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

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        this.stakingHelperContract.populateTransaction.stake(
          user,
          convertedAmount,
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

  @StakingValidator
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

  @StakingValidator
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

  @StakingValidator
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

  @StakingValidator
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
}
