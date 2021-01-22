import { Provider } from '@ethersproject/providers';
import { Signer, Contract } from 'ethers';

export interface ContractsFactory {
  connect: (address: string, signerOrProvider: Signer | Provider) => Contract;
}
