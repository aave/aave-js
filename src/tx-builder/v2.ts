import { providers } from 'ethers';
import { Network, Market, DefaultProviderKeys, TxBuilderConfig } from './types';
import TxBuilderInterface from './interfaces/TxBuilder';
import LendingPoolInterface from './interfaces/v2/LendingPool';
import LendingPool from './services/v2/LendingPool';
import BaseTxBuilder from './txBuilder';
import WETHGatewayInterface from './interfaces/WETHGateway';
import WETHGatewayService from './services/WETHGateway';
import BaseDebtTokenInterface from './interfaces/BaseDebtToken';
import BaseDebtToken from './services/BaseDebtToken';
import LiquiditySwapAdapterService from './services/LiquiditySwapAdapterParaswap';
import LiquiditySwapAdapterInterface from './interfaces/LiquiditySwapAdapterParaswap';
import RepayWithCollateralAdapterService from './services/RepayWithCollateralAdapter';
import RepayWithCollateralAdapterInterface from './interfaces/RepayWithCollateralAdapter';
import AaveGovernanceV2Interface from './interfaces/v2/AaveGovernanceV2';
import GovernanceDelegationTokenInterface from './interfaces/v2/GovernanceDelegationToken';
import AaveGovernanceV2Service from './services/v2/AaveGovernanceV2';
import GovernanceDelegationTokenService from './services/v2/GovernanceDelegationTokenService';

export default class TxBuilder
  extends BaseTxBuilder
  implements TxBuilderInterface
{
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
    defaultProviderKeys?: DefaultProviderKeys,
    config?: TxBuilderConfig
  ) {
    super(network, injectedProvider, defaultProviderKeys, config);

    this.lendingPools = {};
    this.baseDebtTokenService = new BaseDebtToken(
      this.configuration,
      this.erc20Service
    );

    this.wethGatewayService = new WETHGatewayService(
      this.configuration,
      this.baseDebtTokenService,
      this.erc20Service
    );

    if (this.txBuilderConfig.swapCollateral) {
      this.liquiditySwapAdapterService = new LiquiditySwapAdapterService(
        this.configuration,
        this.txBuilderConfig.swapCollateral
      );
    }

    if (this.txBuilderConfig.repayWithCollateral) {
      this.repayWithCollateralAdapterService =
        new RepayWithCollateralAdapterService(
          this.configuration,
          this.txBuilderConfig.repayWithCollateral
        );
    }

    if (this.txBuilderConfig.governance) {
      this.aaveGovernanceV2Service = new AaveGovernanceV2Service(
        this.configuration,
        this.txBuilderConfig.governance
      );
    }

    this.governanceDelegationTokenService =
      new GovernanceDelegationTokenService(this.configuration);
  }

  public getLendingPool = (market: Market): LendingPoolInterface => {
    if (
      this.txBuilderConfig.lendingPool &&
      this.txBuilderConfig.lendingPool[market]
    ) {
      if (!this.lendingPools[market]) {
        this.lendingPools[market] = new LendingPool(
          this.configuration,
          this.erc20Service,
          this.synthetixService,
          this.wethGatewayService,
          this.liquiditySwapAdapterService,
          this.repayWithCollateralAdapterService,
          market,
          this.txBuilderConfig.lendingPool[market]
        );
      }

      return this.lendingPools[market];
    } else {
      throw new Error(
        `Market: ${market} not in configuration. Please change market or add it to the configuration object`
      );
    }
  };
}
