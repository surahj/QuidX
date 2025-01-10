import { PaystackService } from './services/paystack.service';
import { Module } from '@nestjs/common';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { PostgresPrismaService } from '@database/postgres-prisma.service';
import { PaymentWebhookController } from './controllers/payment-webhook.controller';

@Module({
  controllers: [PaymentController, PaymentWebhookController],
  providers: [PaymentService, PostgresPrismaService, PaystackService],
})
export class PaymentModule {}
