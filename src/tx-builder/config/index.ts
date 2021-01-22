import { BigNumber, constants } from 'ethers';
import {
  EnabledNetworksType,
  Market,
  Network,
  Stake,
  StakingConfigType,
} from '../types';

export const DEFAULT_MAX_GAS_REQUIRED = 1100000;
export const DEFAULT_NULL_VALUE_ON_TX = BigNumber.from(0).toHexString();
export const DEFAULT_APPROVE_AMOUNT = constants.MaxUint256.toString();
// export const DEFAULT_APPROVE_AMOUNT = BigNumber.from('1000000000')
//   .mul(BigNumber.from(Math.pow(10, 18).toString()))
//   .toString(); // 1 billion
export const FIRST_TX_GASLIMIT_DEPOSIT = '400000';
export const DEFAULT_MAX_SWAP_COLLATERAL_GASS = '3000000';
export const DEFAULT_MAX_REPAY_WITH_COLLATERAL_GASS = '3000000';
export const FIRST_TX_GASLIMIT_REPAY = '900000';
export const FIRST_TX_GASLIMIT_LIQUIDATION = '1500000';
export const FIRST_TX_GASLIMIT_LIQUIDATION_SNX = '2500000';
export const FIRST_TX_GASLIMIT_STAKE = '900000';
export const FIRST_TX_GASLIMIT_MIGRATION = '400000';
export const MIGRATION_TX_LIMIT = '400000';
export const STAKING_TX_GASLIMIT = '400000';
export const MAX_UINT_AMOUNT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935';
export const SUPER_BIG_ALLOWANCE_NUMBER =
  '11579208923731619542357098500868790785326998466564056403945758400791';
export const API_ETH_MOCK_ADDRESS =
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const uniswapEthAmount = '0.1'; // ETH, with the token amount calculated in the uniswap side
export const SURPLUS = '0.05';

export const distinctStakingAddressesBetweenTokens: StakingConfigType = {
  [Stake.Aave]: {
    [Network.kovan]: {
      canUsePermit: true,
      TOKEN_STAKING_ADDRESS: '0xf2fbf9A6710AfDa1c4AaB2E922DE9D69E0C97fd2',
      STAKING_HELPER_ADDRESS: '0xf267aCc8BF1D8b41c89b6dc1a0aD8439dfbc890c',
    },
    [Network.ropsten]: {
      canUsePermit: false,
      TOKEN_STAKING_ADDRESS: '',
      STAKING_HELPER_ADDRESS: '',
    },
    [Network.mainnet]: {
      canUsePermit: true,
      TOKEN_STAKING_ADDRESS: '0x4da27a545c0c5b758a6ba100e3a049001de870f5',
      STAKING_HELPER_ADDRESS: '0xce0424653fb2fd48ed1b621bdbd60db16b2e388a',
    },
  },
  [Stake.Balancer]: {
    [Network.kovan]: {
      canUsePermit: false,
      TOKEN_STAKING_ADDRESS: '0x31ce45Ab6E26C72c47C52c27498D460099545ef2',
      STAKING_HELPER_ADDRESS: '',
    },
    [Network.ropsten]: {
      canUsePermit: false,
      TOKEN_STAKING_ADDRESS: '',
      STAKING_HELPER_ADDRESS: '',
    },
    [Network.mainnet]: {
      canUsePermit: false,
      TOKEN_STAKING_ADDRESS: '',
      STAKING_HELPER_ADDRESS: '',
    },
  },
};

export const enabledNetworksByService: EnabledNetworksType = {
  staking: {
    [Stake.Balancer]: [Network.kovan],
    [Stake.Aave]: [Network.kovan, Network.mainnet],
  },
  lendingPool: {
    [Market.Proto]: [Network.kovan, Network.mainnet],
  },
  governance: [Network.kovan, Network.mainnet],
  wethGateway: [Network.kovan, Network.mainnet],
  faucet: [Network.kovan],
  liquiditySwapAdapter: [Network.kovan, Network.mainnet],
  repayWithCollateralAdapter: [Network.kovan, Network.mainnet],
  aaveGovernanceV2: [Network.kovan, Network.mainnet],
};

export * from './v2/addresses';
