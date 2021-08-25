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

  public incentiveService: IncentivesControllerInterface;

  readonly stakings: { [stake: string]: StakingInterface };

  readonly faucets: { [market: string]: FaucetInterface };

  readonly txBuilderConfig: TxBuilderConfig;

  constructor(
    network: Network = Network.mainnet,
    injectedProvider?: providers.Provider | string | undefined,
    defaultProviderKeys?: DefaultProviderKeys,
    config: TxBuilderConfig = defaultConfig
  ) {
    this.txBuilderConfig = config;
    let provider: providers.Provider;
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
    } else if (injectedProvider instanceof providers.Provider) {
      provider = injectedProvider;
    } else {
      provider = new providers.Web3Provider(injectedProvider, chainId);
    }

    this.configuration = { network, provider };

    this.erc20Service = new ERC20Service(this.configuration);
    this.synthetixService = new SynthetixService(this.configuration);

    this.ltaMigratorService = new LTAMigratorService(
      this.configuration,
      this.erc20Service,
      this.txBuilderConfig.migrator?.[network]
    );

    this.incentiveService = new IncentivesController(
      this.configuration,
      this.txBuilderConfig.incentives?.[network]
    );

    this.stakings = {};
    this.faucets = {};
  }

  public getFaucet = (market: string): FaucetInterface => {
    if (!this.faucets[market]) {
      const { network } = this.configuration;
      this.faucets[market] = new FaucetService(
        this.configuration,
        this.txBuilderConfig.lendingPool?.[network]?.[market]
      );
    }
    return this.faucets[market];
  };

  public getStaking = (stake: string): StakingInterface => {
    if (!this.stakings[stake]) {
      const { network } = this.configuration;
      const stakingConfig = this.txBuilderConfig.staking?.[network]?.[stake];

      this.stakings[stake] = new StakingService(
        this.configuration,
        this.erc20Service,
        stake,
        stakingConfig
      );
    }
    return this.stakings[stake];
  };
}
