import { BigNumber, constants } from 'ethers';
import {
  EnabledNetworksType,
  GasRecommendationType,
  Market,
  Network,
  ProtocolAction,
  Stake,
  StakingConfigType,
  StakeActions,
} from '../types';

export const DEFAULT_NULL_VALUE_ON_TX = BigNumber.from(0).toHexString();
export const DEFAULT_APPROVE_AMOUNT = constants.MaxUint256.toString();
export const MAX_UINT_AMOUNT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935';
export const SUPER_BIG_ALLOWANCE_NUMBER =
  '11579208923731619542357098500868790785326998466564056403945758400791';
export const API_ETH_MOCK_ADDRESS =
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const uniswapEthAmount = '0.1';
export const SURPLUS = '0.05';

export const gasLimitRecommendations: GasRecommendationType = {
  [ProtocolAction.default]: {
    limit: '210000',
    recommended: '210000',
  },
  [ProtocolAction.deposit]: {
    limit: '300000',
    recommended: '300000',
  },
  [ProtocolAction.withdraw]: {
    limit: '230000',
    recommended: '300000',
  },
  [ProtocolAction.liquidationCall]: {
    limit: '700000',
    recommended: '700000',
  },
  [ProtocolAction.liquidationFlash]: {
    limit: '995000',
    recommended: '995000',
  },
  [ProtocolAction.repay]: {
    limit: '300000',
    recommended: '300000',
  },
  [ProtocolAction.borrowETH]: {
    limit: '450000',
    recommended: '450000',
  },
  [ProtocolAction.withdrawETH]: {
    limit: '640000',
    recommended: '640000',
  },
  [ProtocolAction.swapCollateral]: {
    limit: '700000',
    recommended: '700000',
  },
  [ProtocolAction.repayCollateral]: {
    limit: '700000',
    recommended: '700000',
  },
};

export const distinctStakingAddressesBetweenTokens: StakingConfigType = {
  [Stake.Aave]: {
    [Network.kovan]: {
      TOKEN_STAKING_ADDRESS: '0xf2fbf9A6710AfDa1c4AaB2E922DE9D69E0C97fd2',
    },
    [Network.ropsten]: {
      TOKEN_STAKING_ADDRESS: '',
    },
    [Network.mainnet]: {
      TOKEN_STAKING_ADDRESS: '0x4da27a545c0c5b758a6ba100e3a049001de870f5',
    },
  },
  [Stake.Balancer]: {
    [Network.kovan]: {
      TOKEN_STAKING_ADDRESS: '0x31ce45Ab6E26C72c47C52c27498D460099545ef2',
    },
    [Network.ropsten]: {
      TOKEN_STAKING_ADDRESS: '',
    },
    [Network.mainnet]: {
      TOKEN_STAKING_ADDRESS: '0xa1116930326D21fB917d5A27F1E9943A9595fb47',
    },
  },
};

export const enabledNetworksByService: EnabledNetworksType = {
  staking: {
    [StakeActions.signStaking]: {
      [Stake.Balancer]: [Network.kovan, Network.mainnet],
      [Stake.Aave]: [Network.kovan, Network.mainnet],
    },
    [StakeActions.stakeWithPermit]: {
      [Stake.Balancer]: [Network.kovan],
      [Stake.Aave]: [Network.kovan],
    },
    [StakeActions.stake]: {
      [Stake.Balancer]: [Network.kovan, Network.mainnet],
      [Stake.Aave]: [Network.kovan, Network.mainnet],
    },
    [StakeActions.redeem]: {
      [Stake.Balancer]: [Network.kovan, Network.mainnet],
      [Stake.Aave]: [Network.kovan, Network.mainnet],
    },
    [StakeActions.cooldown]: {
      [Stake.Balancer]: [Network.kovan, Network.mainnet],
      [Stake.Aave]: [Network.kovan, Network.mainnet],
    },
    [StakeActions.claimRewards]: {
      [Stake.Balancer]: [Network.kovan, Network.mainnet],
      [Stake.Aave]: [Network.kovan, Network.mainnet],
    },
    [StakeActions.claimRewardsAndStake]: {
      [Stake.Balancer]: [Network.kovan, Network.mainnet],
      [Stake.Aave]: [Network.kovan, Network.mainnet],
    },
    [StakeActions.claimRewardsAndRedeem]: {
      [Stake.Balancer]: [Network.kovan],
      [Stake.Aave]: [Network.kovan],
    },
    [StakeActions.claimAllRewards]: {
      [Stake.Balancer]: [Network.kovan],
      [Stake.Aave]: [Network.kovan],
    },
    [StakeActions.claimAllRewardsAndStake]: {
      [Stake.Balancer]: [Network.kovan],
      [Stake.Aave]: [Network.kovan],
    },
  },
  claimStakingRewardsHelper: [Network.kovan],
  lendingPool: {
    [Market.Proto]: [Network.kovan, Network.mainnet],
    [Market.AMM]: [Network.kovan, Network.mainnet],
  },
  governance: [Network.kovan, Network.mainnet],
  wethGateway: [Network.kovan, Network.mainnet],
  faucet: [Network.kovan],
  liquiditySwapAdapter: [Network.kovan, Network.mainnet],
  repayWithCollateralAdapter: [Network.kovan, Network.mainnet],
  aaveGovernanceV2: [Network.kovan, Network.mainnet],
};

export * from './v2/addresses';
