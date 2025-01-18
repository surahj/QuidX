import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  Currency,
  mapUserPaymentToResponse,
  PaystackCreditPaymentDto,
} from '../dto/payment.dto';
import { PostgresPrismaService } from '@database/postgres-prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { PaystackService } from './paystack.service';
import { createHmac } from 'crypto';
import { TransactionStatus } from '../enums';
import { Decimal } from '@prisma/client/runtime';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    private readonly prisma: PostgresPrismaService,
    private readonly paystackService: PaystackService,
  ) {}

  async paystack(
    userId: string,
    payload: PaystackCreditPaymentDto,
  ): Promise<{
    transaction: any;
    paymentUrl: string;
  }> {
    const { redirectUrl, packageId } = payload;

    const payment = await this.initiate(userId, payload);

    const {
      transaction,
      metadata: { email },
    } = payment;

    const { id: ref, amount, currency } = transaction;

    const response = await this.paystackService.initiate({
      currency,
      amount,
      email,
      redirectUrl,
      ref,
    });

    const {
      data: { authorization_url: paymentUrl },
    } = response;

    if (!paymentUrl)
      throw new InternalServerErrorException('Payment initiation failed');

    const tx = await this.prisma.paymentHistory.create({
      data: {
        user: { connect: { id: userId } },
        id: transaction.id,
        amount: transaction.amount,
        packageId,
        currency,
      },
    });

    return {
      transaction: mapUserPaymentToResponse(tx),
      paymentUrl,
    };
  }

  private async initiate(
    userId: string,
    payload: PaystackCreditPaymentDto,
  ): Promise<{
    transaction: {
      id: string;
      userId: string;
      amount: any;
      currency: Currency;
    };
    metadata: {
      email: string;
    };
  }> {
    const { packageId, currency } = payload;

    const creditPackage = await this.prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!creditPackage) throw new NotFoundException('Package not found');

    let amount = new Decimal(+creditPackage.amount);

    if (creditPackage.currency === Currency.USD && currency !== Currency.USD) {
      const exchangeRate = await this.prisma.exchangeRate.findUnique({
        where: { unit: currency },
      });

      if (!exchangeRate) {
        throw new BadRequestException('Invalid currency');
      }

      const value = exchangeRate.value;

      amount = amount.times(+value);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user)
      throw new HttpException(
        {
          status: 404,
          message: 'User not found',
        },
        404,
      );

    const transaction = {
      id: uuidv4(),
      userId: user.id,
      amount,
      currency,
    };

    return {
      transaction,
      metadata: {
        email: user.email,
      },
    };
  }

  async confirmPaystack(
    payload: any,
    signature: string,
  ): Promise<{ message: string }> {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    const hash = createHmac('sha512', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) {
      throw new BadRequestException('Webhook Signature Validation Error');
    }

    const { data, event } = payload;
    const allowedEvent = [
      'charge.success',
      'transfer.success',
      'transfer.failed',
      'transfer.reversed',
    ];

    if (!allowedEvent.includes(event) || !data.reference) {
      throw new BadRequestException('Invalid event type');
    }

    const transaction = await this.prisma.paymentHistory.findUnique({
      where: { id: data.reference },
    });

    if (!transaction) throw new BadRequestException('Transaction not found');

    if (transaction.status === TransactionStatus.Completed) {
      return { message: 'Transaction already processed' };
    }

    const { id: transactionId } = transaction;

    const { status, amount, fee, id } = await this.paystackService.verify(
      transactionId,
    );

    if (status === 'success') {
      return this.confirm({
        paymentTxn: transaction,
        amount,
        fee,
        ref: id,
      });
    }
  }

  async getPackages() {
    return this.prisma.package.findMany();
  }

  private async confirm(payload: {
    paymentTxn: any;
    amount: number;
    ref?: string;
    fee?: number;
  }): Promise<{ message: string }> {
    const { amount: amountPaid, paymentTxn: transaction, ref } = payload;

    const { amount } = transaction;

    if (+amountPaid && +amountPaid < +amount) {
      throw new UnprocessableEntityException(
        'Incorrect amount paid. Contact support!',
      );
    }

    try {
      const fee = payload.fee ?? transaction.fee;

      const creditPackage = await this.prisma.package.findUnique({
        where: { id: transaction.packageId },
      });

      await this.prisma.user.update({
        where: { id: transaction.userId },
        data: {
          credit: {
            increment: creditPackage.credit,
          },
        },
      });

      await this.prisma.paymentHistory.update({
        where: { id: transaction.id },
        data: {
          fee,
          ref: ref.toString(),
          status: TransactionStatus.Completed,
        },
      });

      return { message: 'Payment processed successfully' };
    } catch (error) {
      this.logger.log(error);
      throw new InternalServerErrorException(
        'An error occurred while processing payment',
      );
    }
  }
}
