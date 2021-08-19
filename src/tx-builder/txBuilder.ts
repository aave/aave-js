import { ethers, providers } from 'ethers';
import FaucetInterface from './interfaces/Faucet';
import IERC20ServiceInterface from './interfaces/ERC20';
import LTAMigratorInterface from './interfaces/LTAMigrator';
import StakingInterface from './interfaces/Staking';
import SynthetixInterface from './interfaces/Synthetix';
import ERC20Service from './services/ERC20';
import FaucetService from './services/Faucet';
import LTAMigratorService from './services/LTAMigrator';
import StakingService from './services/Staking';
import SynthetixService from './services/SynthetixService';
import {
  ChainId,
  Configuration,
  DefaultProviderKeys,
  Network,
  TxBuilderConfig,
} from './types';
import IncentivesController, {
  IncentivesControllerInterface,
} from './services/IncentivesController';
import { defaultConfig } from './config/defaultConfig';

export default class BaseTxBuilder {
  readonly configuration: Configuration;

  public erc20Service: IERC20ServiceInterface;

  public synthetixService: SynthetixInterface;

  public ltaMigratorService: LTAMigratorInterface;

  public faucetService: FaucetInterface;

  public incentiveService: IncentivesControllerInterface;

  readonly stakings: { [stake: string]: StakingInterface };

  readonly txBuilderConfig: TxBuilderConfig;

  constructor(
    network: Network = Network.mainnet,
    injectedProvider?:
      | providers.ExternalProvider
      | providers.StaticJsonRpcProvider
      | providers.Web3Provider
      | string
      | undefined,
    defaultProviderKeys?: DefaultProviderKeys,
    config: TxBuilderConfig = defaultConfig
  ) {
    if (!config) {
    }

    let provider: providers.Provider;
    this.txBuilderConfig = config;
    // TODO: this is probably not enough as we use network down the road
    const chainId = ChainId[network];

    if (!injectedProvider) {
      if (defaultProviderKeys && Object.keys(defaultProviderKeys).length > 1) {
        provider = ethers.getDefaultProvider(network, defaultProviderKeys);
      } else {
        provider = ethers.getDefaultProvider(network);
        console.log(
          `These API keys are a provided as a community resource by the backend services for low-traffic projects and for early prototyping.
          It is highly recommended to use own keys: https://docs.ethers.io/v5/api-keys/`
        );
      }
    } else if (typeof injectedProvider === 'string') {
      provider = new providers.StaticJsonRpcProvider(injectedProvider, chainId);
    } else if (
      injectedProvider instanceof providers.Web3Provider ||
      injectedProvider instanceof providers.StaticJsonRpcProvider
    ) {
      provider = injectedProvider;
    } else {
      provider = new providers.Web3Provider(injectedProvider, chainId);
    }

    this.configuration = { network, provider };

    this.erc20Service = new ERC20Service(this.configuration);
    this.synthetixService = new SynthetixService(this.configuration);

    if (this.txBuilderConfig.migrator) {
      this.ltaMigratorService = new LTAMigratorService(
        this.configuration,
        this.erc20Service,
        this.txBuilderConfig.migrator
      );
    }

    if (this.txBuilderConfig.faucet) {
      this.faucetService = new FaucetService(
        this.configuration,
        this.txBuilderConfig.faucet
      );
    }

    if (this.txBuilderConfig.incentives) {
      this.incentiveService = new IncentivesController(
        this.configuration,
        this.txBuilderConfig.incentives
      );
    }
    this.stakings = {};
  }

  public getStaking = (stake: string): StakingInterface => {
    if (!this.stakings[stake]) {
      if (this.txBuilderConfig.staking && this.txBuilderConfig.staking[stake]) {
        this.stakings[stake] = new StakingService(
          this.configuration,
          this.erc20Service,
          stake,
          this.txBuilderConfig.staking[stake]
        );
      } else {
        throw new Error(
          `Stake token: ${stake} doesn't exist. Please review the configuration.`
        );
      }
    }
    return this.stakings[stake];
  };
}
