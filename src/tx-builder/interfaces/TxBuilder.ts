import { Market, Stake } from '../types';
import IERC20ServiceInterface from './ERC20';
import LendingPoolInterfaceV2 from './v2/LendingPool';
import SynthetixInterface from './Synthetix';
import LTAMigratorInterface from './LTAMigrator';
import StakingInterface from './Staking';
import WETHGatewayInterface from './WETHGateway';
import FaucetInterface from './Faucet';
import AaveGovernanceV2Interface from './v2/AaveGovernanceV2';
import GovernanceDelegationTokenInterface from './v2/GovernanceDelegationToken';
import FlashLiquidationAdapterInterface from './v2/FlashLiquidationAdapter';

export default interface TxBuilderInterface {
  erc20Service: IERC20ServiceInterface;
  synthetixService: SynthetixInterface;
  ltaMigratorService: LTAMigratorInterface;
  wethGatewayService: WETHGatewayInterface;
  faucetService: FaucetInterface;
  aaveGovernanceV2Service: AaveGovernanceV2Interface;
  governanceDelegationTokenService: GovernanceDelegationTokenInterface;
  getLendingPool: (market: Market) => LendingPoolInterfaceV2;
  getFlashLiquidation: (market: Market) => FlashLiquidationAdapterInterface;
  getStaking: (stake: Stake) => StakingInterface;
}
