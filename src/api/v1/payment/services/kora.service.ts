import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import axios from 'axios';
import { PaystackPayload } from '../dto';
import { KoraPayResponse } from '../dto/payment.dto';

@Injectable()
export class KoraPayService {
  private baseUrl;
  private headers;
  private notifcationUrl;

  private readonly logger = new Logger(KoraPayService.name);
  constructor() {
    this.baseUrl = 'https://api.korapay.com/merchant/api/v1';
    this.headers = {
      Authorization: `Bearer ${process.env.KORAPAY_SECRET_KEY}`,
      'Content-Type': 'application/json',
    };

    this.notifcationUrl = process.env.KORAPAY_NOTIFICATION_URL;
  }

  async verify(reference: string): Promise<KoraPayResponse> {
    const data = await this.sendGetRequest(`/charges/${reference}`);

    if (data.status !== true)
      throw new InternalServerErrorException('Unable to verify transaction');

    const {
      data: { amount, status, amount_paid, fee },
      message,
    } = data;

    if (+amount_paid < +amount) {
      throw new UnprocessableEntityException(
        'Incorrect amount paid. Contact support!',
      );
    }

    return {
      status,
      amount: +amount,
      message,
      fee: +fee,
    };
  }

  async initiate(payload: PaystackPayload): Promise<any> {
    const { amount, currency, ref, email, redirectUrl } = payload;

    const depositPayload = {
      currency,
      amount: +amount,
      reference: ref,
      redirect_url: redirectUrl,
      default_channel: 'card',
      notification_url: this.notifcationUrl,
      customer: {
        email,
      },
    };

    const data = await this.sendPostRequest(
      '/charges/initialize',
      depositPayload,
    );

    console.log(JSON.stringify(data, null, 2));

    return data;
  }

  private async sendPostRequest(endpoint: string, payload: any): Promise<any> {
    try {
      const { data } = await axios.post(`${this.baseUrl}${endpoint}`, payload, {
        headers: this.headers,
      });

      return data;
    } catch (error) {
      console.log(error);
      this.logger.error(`Error making request to ${endpoint}`, error);
      throw new InternalServerErrorException(
        'Unable to process transaction, try again later!',
      );
    }
  }

  private async sendGetRequest(endpoint: string): Promise<any> {
    try {
      const { data } = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: this.headers,
      });

      return data;
    } catch (error) {
      this.logger.error(`Error making request to ${endpoint}`, error);
      throw new InternalServerErrorException(
        'Unable to process request, try again later!',
      );
    }
  }
}
