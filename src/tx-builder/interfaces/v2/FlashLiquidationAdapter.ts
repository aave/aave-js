import { EthereumTransactionTypeExtended } from '../../types';

import { Liquidation } from '../../types/FlashLiquidationAdapter';

export default interface FlashLiquidationAdapterInterface {
  liquidation(args: Liquidation): Promise<EthereumTransactionTypeExtended[]>;
}
