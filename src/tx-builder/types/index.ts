import { providers, BigNumber, BytesLike, PopulatedTransaction } from 'ethers';

export type tEthereumAddress = string;
export type tStringCurrencyUnits = string; // ex 2.5 eth
export type tStringDecimalUnits = string; // ex 2500000000000000000
export type ENS = string; // something.eth

/** InterestRate options */
export enum InterestRate {
  None = 'None',
  Stable = 'Stable',
  Variable = 'Variable',
}

export enum Market {
  Proto = 'proto',
  AMM = 'amm',
}

export enum Network {
  mainnet = 'mainnet',
  ropsten = 'ropsten',
  kovan = 'kovan',
  polygon = 'polygon',
  fork = 'fork',
  mumbai = 'mumbai',
  polygon_fork = 'polygon_fork',
}

export enum ChainId {
  mainnet = 1,
  ropsten = 3,
  kovan = 42,
  polygon = 137,
  fork = 1337,
  mumbai = 80001,
  polygon_fork = 1338,
}

export type GovernanceConfig = {
  [network: string]: {
    AAVE_GOVERNANCE_V2: tEthereumAddress;
    AAVE_GOVERNANCE_V2_EXECUTOR_SHORT: tEthereumAddress;
    AAVE_GOVERNANCE_V2_EXECUTOR_LONG: tEthereumAddress;
    AAVE_GOVERNANCE_V2_HELPER: tEthereumAddress;
  };
};

export type FaucetConfig = {
  [network: string]: { FAUCET: tEthereumAddress };
};

export type IncentivesConfig = {
  [network: string]: {
    INCENTIVES_CONTROLLER: tEthereumAddress;
    INCENTIVES_CONTROLLER_REWARD_TOKEN: tEthereumAddress;
  };
};

export type MigratorConfig = {
  [network: string]: { LEND_TO_AAVE_MIGRATOR: tEthereumAddress };
};

export type LendingPoolNetworkConfig = {
  [network: string]: {
    LENDINGPOOL_ADDRESS: tEthereumAddress;
    WETH_GATEWAY: tEthereumAddress;
    SYNTHETIX_PROXY_ADDRESS?: tEthereumAddress;
    FLASHLIQUIDATION?: tEthereumAddress;
  };
};

export type LendingPoolConfig = {
  [market: string]: LendingPoolNetworkConfig;
};

export type StakingNetworkConfig = {
  [network: string]: {
    TOKEN_STAKING_ADDRESS: tEthereumAddress;
    STAKING_REWARD_TOKEN_ADDRESS: tEthereumAddress;
    STAKING_HELPER_ADDRESS?: tEthereumAddress;
  };
};

export type StakingConfig = {
  [stake: string]: StakingNetworkConfig;
};

export type SwapCollateralConfig = {
  [network: string]: { SWAP_COLLATERAL_ADAPTER: tEthereumAddress };
};

export type RepayWithCollateralConfig = {
  [network: string]: { REPAY_WITH_COLLATERAL_ADAPTER: tEthereumAddress };
};

export type TxBuilderConfig = {
  governance?: GovernanceConfig;
  faucet?: FaucetConfig;
  incentives?: IncentivesConfig;
  migrator?: MigratorConfig;
  lendingPool?: LendingPoolConfig;
  staking?: StakingConfig;
  swapCollateral?: SwapCollateralConfig;
  repayWithCollateral?: RepayWithCollateralConfig;
};

export enum eEthereumTxType {
  ERC20_APPROVAL = 'ERC20_APPROVAL',
  DLP_ACTION = 'DLP_ACTION',
  GOVERNANCE_ACTION = 'GOVERNANCE_ACTION',
  GOV_DELEGATION_ACTION = 'GOV_DELEGATION_ACTION',
  STAKE_ACTION = 'STAKE_ACTION',
  MIGRATION_LEND_AAVE = 'MIGRATION_LEND_AAVE',
  FAUCET_MINT = 'FAUCET_MINT',
  REWARD_ACTION = 'REWARD_ACTION',
}

export enum ProtocolAction {
  default = 'default',
  withdraw = 'withdraw',
  deposit = 'deposit',
  liquidationCall = 'liquidationCall',
  liquidationFlash = 'liquidationFlash',
  repay = 'repay',
  swapCollateral = 'swapCollateral',
  repayCollateral = 'repayCollateral',
  withdrawETH = 'withdrawETH',
  borrowETH = 'borrwoETH',
}

export enum GovernanceVote {
  Abstain = 0,
  Yes = 1,
  No = 2,
}

export enum Stake {
  Aave = 'Aave',
  Balancer = 'Balancer',
}

export type GasRecommendationType = {
  [action: string]: {
    limit: string;
    recommended: string;
  };
};

export type GeneratedTx = {
  tx: transactionType;
  gas: {
    price: string;
    limit: string;
  };
};

export type transactionType = {
  value?: string;
  from?: string;
  to?: string;
  nonce?: number;
  gasLimit?: BigNumber;
  gasPrice?: BigNumber;
  data?: string;
  chainId?: number;
};

export type AddressModel = {
  ADDRESS_PROVIDER_ADDRESS: tEthereumAddress;
  LENDINGPOOL_ADDRESS: tEthereumAddress;
  LENDINGPOOL_CORE_ADDRESS: tEthereumAddress;
  SYNTHETIX_PROXY_ADDRESS: tEthereumAddress;
  GOVERNANCE_PROTO_CONTRACT: tEthereumAddress;
  LEND_TO_AAVE_MIGRATOR: tEthereumAddress;
  WETH_GATEWAY: tEthereumAddress;
  FAUCET: tEthereumAddress;
  SWAP_COLLATERAL_ADAPTER: tEthereumAddress;
  REPAY_WITH_COLLATERAL_ADAPTER: tEthereumAddress;
  AAVE_GOVERNANCE_V2: tEthereumAddress;
  AAVE_GOVERNANCE_V2_EXECUTOR_SHORT: tEthereumAddress;
  AAVE_GOVERNANCE_V2_EXECUTOR_LONG: tEthereumAddress;
  AAVE_GOVERNANCE_V2_HELPER: tEthereumAddress;
  FLASHLIQUIDATION: tEthereumAddress;
  INCENTIVES_CONTROLLER: tEthereumAddress;
  INCENTIVES_CONTROLLER_REWARD_TOKEN: tEthereumAddress;
};

export type tCommonContractAddressBetweenMarkets = Pick<
  AddressModel,
  | 'SYNTHETIX_PROXY_ADDRESS'
  | 'GOVERNANCE_PROTO_CONTRACT'
  | 'LEND_TO_AAVE_MIGRATOR'
  | 'WETH_GATEWAY'
  | 'FAUCET'
  | 'SWAP_COLLATERAL_ADAPTER'
  | 'REPAY_WITH_COLLATERAL_ADAPTER'
  | 'FLASHLIQUIDATION'
  | 'INCENTIVES_CONTROLLER'
  | 'INCENTIVES_CONTROLLER_REWARD_TOKEN'
>;

export type tDistinctContractAddressBetweenMarkets = Pick<
  AddressModel,
  | 'ADDRESS_PROVIDER_ADDRESS'
  | 'LENDINGPOOL_ADDRESS'
  | 'LENDINGPOOL_CORE_ADDRESS'
>;

export type tDistinctContractAddressBetweenMarketsV2 = Pick<
  AddressModel,
  'LENDINGPOOL_ADDRESS'
>;

export type tDistinctGovernanceV2Addresses = Pick<
  AddressModel,
  | 'AAVE_GOVERNANCE_V2'
  | 'AAVE_GOVERNANCE_V2_EXECUTOR_SHORT'
  | 'AAVE_GOVERNANCE_V2_EXECUTOR_LONG'
  | 'AAVE_GOVERNANCE_V2_HELPER'
>;

export type tdistinctStakingAddressesBetweenTokens = {
  TOKEN_STAKING_ADDRESS: tEthereumAddress;
  STAKING_REWARD_TOKEN_ADDRESS: tEthereumAddress;
  STAKING_HELPER_ADDRESS: tEthereumAddress;
  canUsePermit: boolean;
};

export type ContractAddresses = {
  [contractName: string]: tEthereumAddress;
};

export type Configuration = {
  network: Network;
  provider: providers.Provider;
};

export type EthereumTransactionTypeExtended = {
  txType: eEthereumTxType;
  tx: () => Promise<transactionType>;
  gas: GasResponse;
};

export type TransactionGenerationMethod = {
  rawTxMethod: () => Promise<PopulatedTransaction>;
  from: tEthereumAddress;
  value?: string;
  gasSurplus?: number;
  action?: ProtocolAction;
};

export type TransactionGasGenerationMethod = {
  txCallback: () => Promise<transactionType>;
  action?: ProtocolAction;
};

export type GasType = {
  gasLimit: string | undefined;
  gasPrice: string;
};
export type GasResponse = (force?: boolean) => Promise<GasType | null>;

export type TokenMetadataType = {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
};

export type DefaultProviderKeys = {
  etherscan?: string;
  infura?: string;
  alchemy?: string;
};

export type GovernanceConfigType = {
  [network: string]: tDistinctGovernanceV2Addresses;
};
export type StakingConfigType = {
  [sToken: string]: {
    [network: string]: tdistinctStakingAddressesBetweenTokens;
  };
};

export type CommonConfigType = {
  [network: string]: tCommonContractAddressBetweenMarkets;
};

export type LendingPoolConfigType = {
  [pool: string]: {
    [network: string]: tDistinctContractAddressBetweenMarketsV2;
  };
};

export type EnabledNetworksType = {
  staking: {
    [sToken: string]: Network[];
  };
  lendingPool: {
    [market: string]: Network[];
  };
  governance: Network[];
  wethGateway: Network[];
  faucet: Network[];
  liquiditySwapAdapter: Network[];
  repayWithCollateralAdapter: Network[];
  aaveGovernanceV2: Network[];
  ltaMigrator: Network[];
  incentivesController: Network[];
};

export type PermitSignature = {
  amount: tStringCurrencyUnits;
  deadline: string;
  v: number;
  r: BytesLike;
  s: BytesLike;
};

export type FlashLoanParams = {
  assetToSwapToList: tEthereumAddress[]; // List of the addresses of the reserve to be swapped to and deposited
  minAmountsToReceive: string[]; // List of min amounts to be received from the swap
  swapAllBalance: boolean[]; // Flag indicating if all the user balance should be swapped
  permitAmount: string[]; // List of amounts for the permit signature
  deadline: string[]; // List of deadlines for the permit signature
  v: number[]; // List of v param for the permit signature
  r: BytesLike[]; // List of r param for the permit signature
  s: BytesLike[]; // List of s param for the permit signature
};
