import { BigNumber } from 'ethers';
import BaseService from './BaseService';
import { Configuration, tStringDecimalUnits } from '../types';
import { ISynthetix, ISynthetix__factory } from '../contract-types';
import SynthetixInterface from '../interfaces/Synthetix';
import { commonContractAddressBetweenMarketsV2 } from '../config';

export default class SynthetixService
  extends BaseService<ISynthetix>
  implements SynthetixInterface
{
  constructor(config: Configuration) {
    super(config, ISynthetix__factory);
  }

  public synthetixValidation = async (
    userAddress: string,
    reserve: string,
    amount: tStringDecimalUnits
  ): Promise<boolean> => {
    const synthAddress =
      commonContractAddressBetweenMarketsV2[this.config.network]
        .SYNTHETIX_PROXY_ADDRESS;

    if (reserve.toUpperCase() === synthAddress.toUpperCase()) {
      return this.isSnxTransferable(userAddress, amount);
    }
    return true;
  };

  readonly isSnxTransferable = async (
    userAddress: string,
    amount: tStringDecimalUnits
  ): Promise<boolean> => {
    const synthContract = this.getContractInstance(
      commonContractAddressBetweenMarketsV2[this.config.network]
        .SYNTHETIX_PROXY_ADDRESS
    );

    const transferableAmount: BigNumber =
      await synthContract.transferableSynthetix(userAddress);
    return BigNumber.from(amount).lte(transferableAmount);
  };
}
