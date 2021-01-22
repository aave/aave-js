import { EthereumTransactionTypeExtended } from '../../types';
import {
  GovCreateType,
  GovCancelType,
  GovQueueType,
  GovExecuteType,
  GovSubmitVoteType,
  GovSubmitVoteSignType,
  GovSignVotingType,
  GovGetProposalsType,
  GovGetProposalType,
  GovGetVotingAtBlockType,
  GovGetVotingSupplyType,
  GovGetTokensVotingPower as GovGetPower,
  GovGetVoteOnProposal,
} from '../../types/GovernanceV2MethodTypes';
import { Proposal, Power, Vote } from '../../types/GovernanceV2ReturnTypes';

export default interface AaveGovernanceV2Interface {
  create: (args: GovCreateType) => Promise<EthereumTransactionTypeExtended[]>;
  cancel: (args: GovCancelType) => Promise<EthereumTransactionTypeExtended[]>;
  queue: (args: GovQueueType) => Promise<EthereumTransactionTypeExtended[]>;
  execute: (args: GovExecuteType) => Promise<EthereumTransactionTypeExtended[]>;
  submitVote: (
    args: GovSubmitVoteType
  ) => Promise<EthereumTransactionTypeExtended[]>;
  submitVoteBySignature: (
    args: GovSubmitVoteSignType
  ) => Promise<EthereumTransactionTypeExtended[]>;
  signVoting: (args: GovSignVotingType) => Promise<string>;
  getProposals: (args: GovGetProposalsType) => Promise<Proposal[]>;
  getProposal: (args: GovGetProposalType) => Promise<Proposal>;
  getPropositionPowerAt: (args: GovGetVotingAtBlockType) => Promise<string>;
  getVotingPowerAt: (args: GovGetVotingAtBlockType) => Promise<string>;
  getTotalPropositionSupplyAt: (
    args: GovGetVotingSupplyType
  ) => Promise<string>;
  getTotalVotingSupplyAt: (args: GovGetVotingSupplyType) => Promise<string>;
  getTokensPower: (args: GovGetPower) => Promise<Power[]>;
  getVoteOnProposal: (args: GovGetVoteOnProposal) => Promise<Vote>;
}
