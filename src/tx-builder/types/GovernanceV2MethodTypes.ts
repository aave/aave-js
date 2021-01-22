import { BytesLike } from 'ethers';
import { tEthereumAddress } from '.';

export enum ExecutorType {
  Short,
  Long,
}

export type GovCreateType = {
  user: tEthereumAddress;
  targets: tEthereumAddress[];
  values: string[];
  signatures: string[];
  calldatas: BytesLike[];
  withDelegateCalls: boolean[];
  ipfsHash: BytesLike;
  executor: ExecutorType;
};
export type GovCancelType = {
  user: tEthereumAddress;
  proposalId: number;
};
export type GovQueueType = {
  user: tEthereumAddress;
  proposalId: number;
};
export type GovExecuteType = {
  user: tEthereumAddress;
  proposalId: number;
};
export type GovSubmitVoteType = {
  user: tEthereumAddress;
  proposalId: number;
  support: boolean;
};
export type GovSubmitVoteSignType = {
  user: tEthereumAddress;
  proposalId: number;
  support: boolean;
  signature: string;
};

export type GovSignVotingType = {
  user: tEthereumAddress;
  support: boolean;
  proposalId: number;
  nonce: number;
};

export type GovGetProposalsType = {
  skip: number;
  limit: number;
};

export type GovGetProposalType = {
  proposalId: number;
};

export type GovGetVotingSupplyType = {
  block: number;
  strategy: tEthereumAddress;
};

export type GovGetVotingAtBlockType = {
  user: tEthereumAddress;
  strategy: tEthereumAddress;
  block: number;
};

export type GovGetTokensVotingPower = {
  user: tEthereumAddress;
  tokens: tEthereumAddress[];
};

export type GovGetVoteOnProposal = {
  proposalId: string;
  user: tEthereumAddress;
};
