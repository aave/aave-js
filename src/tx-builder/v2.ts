import { providers } from 'ethers';
import { Network, Market, DefaultProviderKeys } from './types';
import TxBuilderInterface from './interfaces/TxBuilder';
import LendingPoolInterface from './interfaces/v2/LendingPool';
import LendingPool from './services/v2/LendingPool';
import BaseTxBuilder from './txBuilder';
import WETHGatewayInterface from './interfaces/WETHGateway';
import WETHGatewayService from './services/WETHGateway';
import BaseDebtTokenInterface from './interfaces/BaseDebtToken';
import BaseDebtTokenService from './services/BaseDebtToken';
import LiquiditySwapAdapterService from './services/LiquiditySwapAdapter';
import LiquiditySwapAdapterInterface from './interfaces/LiquiditySwapAdapter';
import RepayWithCollateralAdapterService from './services/RepayWithCollateralAdapter';
import RepayWithCollateralAdapterInterface from './interfaces/RepayWithCollateralAdapter';
import AaveGovernanceV2Interface from './interfaces/v2/AaveGovernanceV2';
import GovernanceDelegationTokenInterface from './interfaces/v2/GovernanceDelegationToken';
import AaveGovernanceV2Service from './services/v2/AaveGovernanceV2';
import GovernanceDelegationTokenService from './services/v2/GovernanceDelegationTokenService';

export default class TxBuilder
  extends BaseTxBuilder
  implements TxBuilderInterface {
  readonly lendingPools: {
    [market: string]: LendingPoolInterface;
  };

  readonly baseDebtTokenService: BaseDebtTokenInterface;

  readonly liquiditySwapAdapterService: LiquiditySwapAdapterInterface;

  readonly repayWithCollateralAdapterService: RepayWithCollateralAdapterInterface;

  public aaveGovernanceV2Service: AaveGovernanceV2Interface;

  public governanceDelegationTokenService: GovernanceDelegationTokenInterface;

  public wethGatewayService: WETHGatewayInterface;

  constructor(
    network: Network = Network.mainnet,
    injectedProvider?:
      | providers.ExternalProvider
      | providers.Web3Provider
      | string
      | undefined,
    defaultProviderKeys?: DefaultProviderKeys
  ) {
    super(network, injectedProvider, defaultProviderKeys);

    this.lendingPools = {};
    this.baseDebtTokenService = new BaseDebtTokenService(
      this.configuration,
      this.erc20Service
    );
    this.wethGatewayService = new WETHGatewayService(
      this.configuration,
      this.baseDebtTokenService,
      this.erc20Service
    );
    this.liquiditySwapAdapterService = new LiquiditySwapAdapterService(
      this.configuration
    );
    this.repayWithCollateralAdapterService = new RepayWithCollateralAdapterService(
      this.configuration
    );
    this.aaveGovernanceV2Service = new AaveGovernanceV2Service(
      this.configuration
    );
    this.governanceDelegationTokenService = new GovernanceDelegationTokenService(
      this.configuration
    );
  }

  public getLendingPool = (market: Market): LendingPoolInterface => {
    if (!this.lendingPools[market]) {
      this.lendingPools[market] = new LendingPool(
        this.configuration,
        this.erc20Service,
        this.synthetixService,
        this.wethGatewayService,
        this.liquiditySwapAdapterService,
        this.repayWithCollateralAdapterService,
        this.baseDebtTokenService,
        market
      );
    }

    return this.lendingPools[market];
  };
}
