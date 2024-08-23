import { Injectable, Logger } from '@nestjs/common';
import { TatumSDK, Ethereum, Network } from '@tatumio/tatum';
import { cryptoPairs } from './rate-pairs/crypto.rate.pairs';
import { forexPairs } from './rate-pairs/forex.rate.pairs';
import { ErrorResponse } from '@common/errors';

@Injectable()
export class RateService {
  private readonly logger = new Logger(RateService.name);

  private async initializeTatum() {
    return TatumSDK.init<Ethereum>({
      network: Network.ETHEREUM,
      apiKey: { v4: process.env.TATUM_API_KEY },
    });
  }

  async getCryptoRates() {
    const tatum = await this.initializeTatum();
    try {
      return await tatum.rates.getCurrentRateBatch([...cryptoPairs]);
    } catch (error) {
      this.logger.error(error);
      throw new ErrorResponse('internal server Error', 500);
    }
  }

  async getForexRates() {
    const tatum = await this.initializeTatum();
    try {
      return await tatum.rates.getCurrentRateBatch([...forexPairs]);
    } catch (error) {
      this.logger.error(error);
      throw new ErrorResponse('internal server Error', 500);
    }
  }
}
