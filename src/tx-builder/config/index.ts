import { BigNumber, constants } from 'ethers';
import {
  ConstantAddressesByNetwork,
  GasRecommendationType,
  Network,
  ProtocolAction,
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
    limit: '1000000',
    recommended: '1000000',
  },
  [ProtocolAction.repayCollateral]: {
    limit: '700000',
    recommended: '700000',
  },
};

export const cosntantAddressesByNetwork: ConstantAddressesByNetwork = {
  [Network.mainnet]: {
    SYNTHETIX_PROXY_ADDRESS: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
  },
};
