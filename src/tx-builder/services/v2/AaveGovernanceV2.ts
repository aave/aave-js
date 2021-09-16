import { Signature, utils } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import {
  IGovernanceStrategy,
  IGovernanceStrategy__factory,
  IGovernanceV2Helper,
  IGovernanceV2Helper__factory,
} from '../../contract-types';
import { IAaveGovernanceV2__factory } from '../../contract-types/factories/IAaveGovernanceV2__factory';
import { IAaveGovernanceV2 } from '../../contract-types/IAaveGovernanceV2';
import AaveGovernanceV2Interface from '../../interfaces/v2/AaveGovernanceV2';
import {
  ChainId,
  Configuration,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  GovernanceConfig,
  tEthereumAddress,
  transactionType,
} from '../../types';
import {
  ExecutorType,
  GovCancelType,
  GovCreateType,
  GovExecuteType,
  GovGetProposalsType,
  GovGetProposalType,
  GovGetVotingAtBlockType,
  GovGetVotingSupplyType,
  GovQueueType,
  GovSignVotingType,
  GovSubmitVoteSignType,
  GovSubmitVoteType,
  GovGetTokensVotingPower as GovGetPower,
  GovGetVoteOnProposal,
} from '../../types/GovernanceV2MethodTypes';
import {
  Proposal,
  ProposalState,
  Power,
  ProposalRPC,
  Vote,
} from '../../types/GovernanceV2ReturnTypes';
import { getProposalMetadata } from '../../utils/ipfs';
import { GovValidator } from '../../validators/methodValidators';
import {
  Is0OrPositiveAmount,
  IsEthAddress,
} from '../../validators/paramValidators';
import BaseService from '../BaseService';

const parseProposal = async (rawProposal: ProposalRPC): Promise<Proposal> => {
  const {
    id,
    creator,
    executor,
    targets,
    values,
    signatures,
    calldatas,
    withDelegatecalls,
    startBlock,
    endBlock,
    executionTime,
    forVotes,
    againstVotes,
    executed,
    canceled,
    strategy,
    ipfsHash: ipfsHex,
    totalVotingSupply,
    minimumQuorum,
    minimumDiff,
    executionTimeWithGracePeriod,
    proposalCreated,
    proposalState,
  } = rawProposal;

  const proposalMetadata = await getProposalMetadata(ipfsHex);
  const proposal: Proposal = {
    id: Number(id.toString()),
    creator,
    executor,
    targets,
    values,
    signatures,
    calldatas,
    withDelegatecalls,
    startBlock: Number(startBlock.toString()),
    endBlock: Number(endBlock.toString()),
    executionTime: executionTime.toString(),
    forVotes: forVotes.toString(),
    againstVotes: againstVotes.toString(),
    executed,
    canceled,
    strategy,
    ipfsHash: proposalMetadata.ipfsHash,
    state: Object.values(ProposalState)[proposalState],
    minimumQuorum: minimumQuorum.toString(),
    minimumDiff: minimumDiff.toString(),
    executionTimeWithGracePeriod: executionTimeWithGracePeriod.toString(),
    title: proposalMetadata.title,
    description: proposalMetadata.description,
    shortDescription: proposalMetadata.shortDescription,
    proposalCreated: Number(proposalCreated.toString()),
    totalVotingSupply: totalVotingSupply.toString(),
  };

  return proposal;
};
export default class AaveGovernanceV2Service
  extends BaseService<IAaveGovernanceV2>
  implements AaveGovernanceV2Interface {
  readonly aaveGovernanceV2Address: string;

  readonly aaveGovernanceV2HelperAddress: string;

  readonly executors: tEthereumAddress[] = [];

  readonly governanceConfig: GovernanceConfig | undefined;

  constructor(
    config: Configuration,
    governanceConfig: GovernanceConfig | undefined
  ) {
    super(config, IAaveGovernanceV2__factory);
    this.governanceConfig = governanceConfig;

    const {
      AAVE_GOVERNANCE_V2,
      AAVE_GOVERNANCE_V2_HELPER,
      AAVE_GOVERNANCE_V2_EXECUTOR_SHORT,
      AAVE_GOVERNANCE_V2_EXECUTOR_LONG,
    } = this.governanceConfig || {};

    this.aaveGovernanceV2Address = AAVE_GOVERNANCE_V2 || '';
    this.aaveGovernanceV2HelperAddress = AAVE_GOVERNANCE_V2_HELPER || '';
    this.executors[ExecutorType.Short] =
      AAVE_GOVERNANCE_V2_EXECUTOR_SHORT || '';
    this.executors[ExecutorType.Long] = AAVE_GOVERNANCE_V2_EXECUTOR_LONG || '';
  }

  @GovValidator
  public async create(
    @IsEthAddress('user')
    {
      user,
      targets,
      values,
      signatures,
      calldatas,
      withDelegateCalls,
      ipfsHash,
      executor,
    }: GovCreateType
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];

    const govContract: IAaveGovernanceV2 = this.getContractInstance(
      this.aaveGovernanceV2Address
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        govContract.populateTransaction.create(
          this.executors[executor],
          targets,
          values,
          signatures,
          calldatas,
          withDelegateCalls,
          ipfsHash
        ),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.GOVERNANCE_ACTION,
      gas: this.generateTxPriceEstimation(txs, txCallback),
    });
    return txs;
  }

  @GovValidator
  public async cancel(
    @IsEthAddress('user')
    @Is0OrPositiveAmount('proposalId')
    { user, proposalId }: GovCancelType
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];
    const govContract: IAaveGovernanceV2 = this.getContractInstance(
      this.aaveGovernanceV2Address
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () => govContract.populateTransaction.cancel(proposalId),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.GOVERNANCE_ACTION,
      gas: this.generateTxPriceEstimation(txs, txCallback),
    });
    return txs;
  }

  @GovValidator
  public async queue(
    @IsEthAddress('user')
    @Is0OrPositiveAmount('proposalId')
    { user, proposalId }: GovQueueType
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];
    const govContract: IAaveGovernanceV2 = this.getContractInstance(
      this.aaveGovernanceV2Address
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () => govContract.populateTransaction.queue(proposalId),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.GOVERNANCE_ACTION,
      gas: this.generateTxPriceEstimation(txs, txCallback),
    });
    return txs;
  }

  @GovValidator
  public async execute(
    @IsEthAddress('user')
    @Is0OrPositiveAmount('proposalId')
    { user, proposalId }: GovExecuteType
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];
    const govContract: IAaveGovernanceV2 = this.getContractInstance(
      this.aaveGovernanceV2Address
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () => govContract.populateTransaction.execute(proposalId),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.GOVERNANCE_ACTION,
      gas: this.generateTxPriceEstimation(txs, txCallback),
    });
    return txs;
  }

  @GovValidator
  public async submitVote(
    @IsEthAddress('user')
    @Is0OrPositiveAmount('proposalId')
    { user, proposalId, support }: GovSubmitVoteType
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];
    const govContract: IAaveGovernanceV2 = this.getContractInstance(
      this.aaveGovernanceV2Address
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        govContract.populateTransaction.submitVote(proposalId, support),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.GOVERNANCE_ACTION,
      gas: this.generateTxPriceEstimation(txs, txCallback),
    });
    return txs;
  }

  @GovValidator
  public async signVoting(
    @Is0OrPositiveAmount('proposalId')
    { support, proposalId }: GovSignVotingType
  ): Promise<string> {
    const typeData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        VoteEmitted: [
          { name: 'id', type: 'uint256' },
          { name: 'support', type: 'bool' },
        ],
      },
      primaryType: 'VoteEmitted' as const,
      domain: {
        name: 'Aave Governance v2',
        chainId: ChainId[this.config.network],
        verifyingContract: this.aaveGovernanceV2Address,
      },
      message: {
        support,
        id: proposalId,
      },
    };

    return JSON.stringify(typeData);
  }

  @GovValidator
  public async submitVoteBySignature(
    @IsEthAddress('user')
    @Is0OrPositiveAmount('proposalId')
    { user, proposalId, support, signature }: GovSubmitVoteSignType
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];
    const govContract: IAaveGovernanceV2 = this.getContractInstance(
      this.aaveGovernanceV2Address
    );

    const sig: Signature = utils.splitSignature(signature);

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        govContract.populateTransaction.submitVoteBySignature(
          proposalId,
          support,
          sig.v,
          sig.r,
          sig.s
        ),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.GOVERNANCE_ACTION,
      gas: this.generateTxPriceEstimation(txs, txCallback),
    });
    return txs;
  }

  @GovValidator
  public async getProposals({
    skip,
    limit,
  }: GovGetProposalsType): Promise<Proposal[]> {
    const { provider }: Configuration = this.config;
    const helper: IGovernanceV2Helper = IGovernanceV2Helper__factory.connect(
      this.aaveGovernanceV2HelperAddress,
      provider
    );

    const result = await helper.getProposals(
      skip.toString(),
      limit.toString(),
      this.aaveGovernanceV2Address
    );

    const proposals: Promise<Proposal[]> = Promise.all(
      result.map(
        async (rawProposal: ProposalRPC): Promise<Proposal> =>
          parseProposal(rawProposal)
      )
    );

    return proposals;
  }

  @GovValidator
  public async getProposal({
    proposalId,
  }: GovGetProposalType): Promise<Proposal> {
    const { provider }: Configuration = this.config;
    const helper: IGovernanceV2Helper = IGovernanceV2Helper__factory.connect(
      this.aaveGovernanceV2HelperAddress,
      provider
    );

    const proposal = await helper.getProposal(
      proposalId,
      this.aaveGovernanceV2Address
    );

    return parseProposal(proposal);
  }

  @GovValidator
  public async getPropositionPowerAt({
    user,
    block,
    strategy,
  }: GovGetVotingAtBlockType): Promise<string> {
    const { provider }: Configuration = this.config;
    const proposalStrategy: IGovernanceStrategy = IGovernanceStrategy__factory.connect(
      strategy,
      provider
    );

    const power = await proposalStrategy.getPropositionPowerAt(
      user,
      block.toString()
    );
    return formatEther(power);
  }

  @GovValidator
  public async getVotingPowerAt({
    user,
    block,
    strategy,
  }: GovGetVotingAtBlockType): Promise<string> {
    const { provider }: Configuration = this.config;
    const proposalStrategy: IGovernanceStrategy = IGovernanceStrategy__factory.connect(
      strategy,
      provider
    );

    const power = await proposalStrategy.getVotingPowerAt(
      user,
      block.toString()
    );
    return formatEther(power);
  }

  @GovValidator
  public async getTotalPropositionSupplyAt({
    block,
    strategy,
  }: GovGetVotingSupplyType): Promise<string> {
    const { provider }: Configuration = this.config;
    const proposalStrategy: IGovernanceStrategy = IGovernanceStrategy__factory.connect(
      strategy,
      provider
    );

    const total = await proposalStrategy.getTotalPropositionSupplyAt(
      block.toString()
    );
    return formatEther(total);
  }

  @GovValidator
  public async getTotalVotingSupplyAt({
    block,
    strategy,
  }: GovGetVotingSupplyType): Promise<string> {
    const { provider }: Configuration = this.config;
    const proposalStrategy: IGovernanceStrategy = IGovernanceStrategy__factory.connect(
      strategy,
      provider
    );

    const total = await proposalStrategy.getTotalVotingSupplyAt(
      block.toString()
    );
    return formatEther(total);
  }

  @GovValidator
  public async getTokensPower({ user, tokens }: GovGetPower): Promise<Power[]> {
    const { provider }: Configuration = this.config;
    const helper: IGovernanceV2Helper = IGovernanceV2Helper__factory.connect(
      this.aaveGovernanceV2HelperAddress,
      provider
    );
    const power = helper.getTokensPower(user, tokens);
    return power as Promise<Power[]>;
  }

  @GovValidator
  public async getVoteOnProposal({
    proposalId,
    user,
  }: GovGetVoteOnProposal): Promise<Vote> {
    const govContract: IAaveGovernanceV2 = this.getContractInstance(
      this.aaveGovernanceV2Address
    );
    return govContract.getVoteOnProposal(proposalId, user) as Promise<Vote>;
  }
}
