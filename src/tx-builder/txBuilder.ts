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
  Stake,
} from './types';

export default class BaseTxBuilder {
  readonly configuration: Configuration;

  public erc20Service: IERC20ServiceInterface;

  public synthetixService: SynthetixInterface;

  public ltaMigratorService: LTAMigratorInterface;

  public faucetService: FaucetInterface;

  readonly stakings: { [stake: string]: StakingInterface };

  constructor(
    network: Network = Network.mainnet,
    injectedProvider?:
      | providers.ExternalProvider
      | providers.Web3Provider
      | string
      | undefined,
    defaultProviderKeys?: DefaultProviderKeys
  ) {
    let provider:
      | providers.JsonRpcProvider
      | providers.BaseProvider
      | providers.Web3Provider;

    const chainId = ChainId[network];

    if (!injectedProvider) {
      if (defaultProviderKeys && Object.keys(defaultProviderKeys).length > 1) {
        provider = ethers.getDefaultProvider(network, defaultProviderKeys);
      } else {
        throw new Error('Need to pass a provider for aave-js to work');
      }
    } else if (typeof injectedProvider === 'string') {
      provider = new providers.JsonRpcProvider(injectedProvider, chainId);
    } else if (injectedProvider instanceof providers.Web3Provider) {
      provider = injectedProvider;
    } else {
      provider = new providers.Web3Provider(injectedProvider, chainId);
    }

    this.configuration = { network, provider };

    this.erc20Service = new ERC20Service(this.configuration);
    this.synthetixService = new SynthetixService(this.configuration);
    this.ltaMigratorService = new LTAMigratorService(
      this.configuration,
      this.erc20Service
    );
    this.faucetService = new FaucetService(this.configuration);

    this.stakings = {};
  }

  public getStaking = (stake?: Stake): StakingInterface => {
    const stakeToken = stake || Stake.Aave;
    if (!this.stakings[stakeToken]) {
      this.stakings[stakeToken] = new StakingService(
        this.configuration,
        this.erc20Service,
        stakeToken
      );
    }

    return this.stakings[stakeToken];
  };
}
