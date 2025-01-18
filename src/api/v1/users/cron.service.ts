import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PostgresPrismaService } from '@database/postgres-prisma.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private readonly postgresPrismaService: PostgresPrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async updateUserCredit(): Promise<void> {
    try {
      this.logger.log('******* BEGIN CREDIT UPDATE *******');

      await this.postgresPrismaService.user.updateMany({
        data: {
          bonusCredit: 50,
        },
      });

      this.logger.log('******* END CREDIT UPDATE *******');
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
