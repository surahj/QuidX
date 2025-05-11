import { PaymentService } from '../services/payment.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { CreditPaymentDto, VerifyKoraPayment } from '../dto/payment.dto';
import { GenericStatus } from '@common/dto/http-status.dto';

@ApiTags('Payment Management')
@ApiBearerAuth('Bearer')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiResponse({
    status: 200,
    description: 'Credit payment initiated successfully',
  })
  @ApiOperation({ summary: 'Paystack Credit Payment' })
  @UseGuards(JwtAuthGuard)
  @Post('/paystack/initiate')
  async paystackDeposit(
    @Req() req,
    @Body() body: CreditPaymentDto,
  ): Promise<any> {
    const user = req?.user;
    const data = await this.paymentService.paystack(user.id, body);

    return new GenericStatus({
      message: 'success',
      data,
    });
  }

  @ApiResponse({
    status: 200,
    description: 'Credit payment initiated successfully',
  })
  @ApiOperation({ summary: 'Credit Payment' })
  @UseGuards(JwtAuthGuard)
  @Post('/korapay/initiate')
  async korapayDeposit(
    @Req() req,
    @Body() body: CreditPaymentDto,
  ): Promise<any> {
    const user = req?.user;
    const data = await this.paymentService.korapay(user.id, body);

    return new GenericStatus({
      message: 'success',
      data,
    });
  }

  @ApiResponse({
    status: 200,
    description: 'Packages retrieved successfully',
  })
  @ApiOperation({ summary: 'Get packages' })
  @Get('/packages')
  async packages(): Promise<any> {
    const data = await this.paymentService.getPackages();

    return new GenericStatus({
      message: 'success',
      data,
    });
  }

  @ApiResponse({
    status: 200,
    description: 'Payment processed successfully',
  })
  @ApiOperation({ summary: 'Verify korapay deposit payment' })
  @Post('/korapay/verify')
  @HttpCode(HttpStatus.OK)
  async confirmPaystack(
    @Query() { reference }: VerifyKoraPayment,
  ): Promise<GenericStatus<{ message: string }>> {
    await this.paymentService.verifyKoraPayment(reference);

    return new GenericStatus({
      message: 'Payment verified successfully',
    });
  }
}
