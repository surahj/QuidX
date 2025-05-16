import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export enum TransactionType {
  CreditPayment = 'credit_payment',
}

export enum Currency {
  USD = 'USD',
  NGN = 'NGN',
}

export const mapUserPaymentToResponse = (data) => ({
  id: data.id,
  ref: data.ref,
  amount: data.amount,
  currency: data.currency,
  status: data.txStatus,
  type: data.txType,
  createdAt: data.createdAt,
});

export class BasePaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  amount: number;
}

export class CreditPaymentDto {
  @ApiProperty()
  @IsOptional()
  @IsUrl()
  redirectUrl?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  packageId: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(Currency)
  currency: Currency = Currency.NGN;
}

export class TransactionDto {
  id?: string;
  userId: string;
  ref?: string;
  amount: number;
  fee?: number;
  currency: string;
}

export class PaymentHistoryDto {
  id: string;
  userId: string;
  ref?: string;
  amount: number;
  fee: number;
  currency: Currency;
  status: string;
  source?: string;
  packageId?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type KoraPayResponse = {
  status: string;
  amount: number;
  message: string;
  fee?: number;
};

export class VerifyKoraPayment {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reference: string;
}
