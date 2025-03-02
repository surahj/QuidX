import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Headers,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { GenericStatus } from '@common/dto/http-status.dto';

@ApiTags('Payment Webhook')
@ApiBearerAuth('Bearer')
@Controller('webhook/payment')
@UseInterceptors(ClassSerializerInterceptor)
export class PaymentWebhookController {
  constructor(private paymentService: PaymentService) {}

  @ApiResponse({
    status: 200,
    description: 'Payment processed successfully',
  })
  @ApiOperation({ summary: 'Verify paystack deposit' })
  @Post('/paystack')
  @HttpCode(HttpStatus.OK)
  async confirmPaystack(
    @Body() req,
    @Headers('x-paystack-signature') signature: string,
  ): Promise<GenericStatus<{ message: string }>> {
    return new GenericStatus({
      message: 'Payment processed successfully',
      data: await this.paymentService.confirmPaystack(req, signature),
    });
  }
}
