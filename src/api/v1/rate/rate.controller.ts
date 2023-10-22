import { Controller, Get } from '@nestjs/common';
import { RateService } from './rate.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Rates')
@Controller('rate')
export class RateController {
  constructor(private readonly rateService: RateService) {}

  @Get('crypto')
  async getCrptoRates() {
    const rates = await this.rateService.getCryptoRates();
    return rates;
  }

  @Get('forex')
  async getForexRates() {
    const rates = await this.rateService.getForexRates();
    return rates;
  }
}
