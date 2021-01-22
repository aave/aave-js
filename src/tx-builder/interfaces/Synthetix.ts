import { tStringDecimalUnits } from '../types';

export default interface SynthetixInterface {
  synthetixValidation: (
    userAddress: string,
    reserve: string,
    amount: tStringDecimalUnits
  ) => Promise<boolean>;
}
