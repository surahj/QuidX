import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import { PaystackPayload, PaystackResponse } from '../dto';

@Injectable()
export class PaystackService {
  private baseUrl;
  private headers;

  private readonly logger = new Logger(PaystackService.name);
  constructor() {
    this.baseUrl = 'https://api.paystack.co';
    this.headers = {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    };
  }

  async verify(reference: string): Promise<PaystackResponse> {
    const data = await this.sendGetRequest(`/transaction/verify/${reference}`);

    if (data.status !== true)
      throw new InternalServerErrorException('Unable to verify transaction');

    const {
      data: { amount, status, fees, id },
      message,
    } = data;

    return {
      id,
      status,
      amount: +amount / 100,
      message,
      fee: +fees / 100,
    };
  }

  async initiate(payload: PaystackPayload): Promise<any> {
    const { amount, currency, ref, email, redirectUrl } = payload;

    const depositPayload = {
      currency,
      amount: +amount * 100,
      reference: ref,
      email,
      callback_url: redirectUrl,
    };

    const data = await this.sendPostRequest(
      '/transaction/initialize',
      depositPayload,
    );

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
