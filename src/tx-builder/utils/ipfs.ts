import axios from 'axios';
import { base58 } from 'ethers/lib/utils';
import { ProposalMetadata } from '../types/GovernanceV2ReturnTypes';

const ipfsEndpoint = 'https://cloudflare-ipfs.com/ipfs';

export function getLink(hash: string): string {
  return `${ipfsEndpoint}/${hash}`;
}

interface MemorizeMetadata {
  [key: string]: ProposalMetadata;
}

const MEMORIZE: MemorizeMetadata = {};

export async function getProposalMetadata(
  hash: string
): Promise<ProposalMetadata> {
  const ipfsHash = base58.encode(Buffer.from(`1220${hash.slice(2)}`, 'hex'));
  if (MEMORIZE[ipfsHash]) return MEMORIZE[ipfsHash];
  try {
    const { data } = await axios.get(getLink(ipfsHash), { timeout: 2000 });

    if (!data?.title) {
      throw Error('Missing title field at proposal metadata.');
    }
    if (!data?.description) {
      throw Error('Missing description field at proposal metadata.');
    }
    if (!data?.shortDescription) {
      throw Error('Missing shortDescription field at proposal metadata.');
    }

    MEMORIZE[ipfsHash] = {
      ipfsHash,
      title: data.title,
      description: data.description,
      shortDescription: data.shortDescription,
    };
    return MEMORIZE[ipfsHash];
  } catch (e) {
    console.error(`@aave/protocol-js: IPFS fetch Error: ${e.message}`);
    return {
      ipfsHash,
      title: `Proposal - ${ipfsHash}`,
      description: `Proposal with invalid metadata format or IPFS gateway is down`,
      shortDescription: `Proposal with invalid metadata format or IPFS gateway is down`,
    };
  }
}
