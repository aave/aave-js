import { BigNumber } from 'ethers';
import BaseService from './BaseService';
import { Configuration, tStringDecimalUnits } from '../types';
import { ISynthetix, ISynthetix__factory } from '../contract-types';
import SynthetixInterface from '../interfaces/Synthetix';
import { cosntantAddressesByNetwork } from '../config';

export default class SynthetixService
  extends BaseService<ISynthetix>
  implements SynthetixInterface {
  readonly synthAddress: string;
  constructor(config: Configuration) {
    super(config, ISynthetix__factory);
    const { network } = this.config;

    this.synthAddress =
      cosntantAddressesByNetwork[network]?.SYNTHETIX_PROXY_ADDRESS || '';
  }

  public synthetixValidation = async (
    userAddress: string,
    reserve: string,
    amount: tStringDecimalUnits
  ): Promise<boolean> => {
    if (reserve.toUpperCase() === this.synthAddress.toUpperCase()) {
      return this.isSnxTransferable(userAddress, amount);
    }
    return true;
  };

  readonly isSnxTransferable = async (
    userAddress: string,
    amount: tStringDecimalUnits
  ): Promise<boolean> => {
    const synthContract = this.getContractInstance(this.synthAddress);

    const transferableAmount: BigNumber = await synthContract.transferableSynthetix(
      userAddress
    );
    return BigNumber.from(amount).lte(transferableAmount);
  };
}
