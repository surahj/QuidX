import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { TokenType } from '@common/enums';
import {
  GenerateTokenOptions,
  TokenData,
  VerifyTokenOptions,
  VerifyOtpParams,
} from './security.interface';
import { ErrorResponse } from '@common/errors';
import RedisClient from '@database/redis';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);
  cache: RedisClient;

  constructor(private readonly jwtService: JwtService) {
    this.cache = new RedisClient();
  }

  public async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(10);
      return bcrypt.hash(password, salt);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  public async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return bcrypt.compare(password, hashedPassword);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  public async generateToken(
    data: TokenData,
    options?: GenerateTokenOptions,
  ): Promise<string> {
    if (options == null) {
      options = {};
    }

    if (options?.expiresIn == null) {
      options['expiresIn'] = '24h';
    }

    if (options?.algorithm == null) {
      options['algorithm'] = 'RS256';
    }

    return this.jwtService.signAsync({ data }, options);
  }

  public verifyToken = async (
    token: string,
    tokenType: TokenType,
    option?: VerifyTokenOptions,
  ): Promise<TokenData> => {
    try {
      const decoded = await this.jwtService.verifyAsync(token, option);

      const data = decoded.data as TokenData;

      if (data.tokenType != tokenType) {
        throw new ErrorResponse('Invalid token type', 400);
      }
      return data;
    } catch (err) {
      let message = 'Invalid Token';
      if (err.name === 'TokenExpiredError') {
        message = 'Token expired';
      }

      throw new ErrorResponse(message, 401);
    }
  };

  public generateOTP = async (userId: string): Promise<string> => {
    // Generate a random number between 100000 and 999999 (inclusive)
    const min = 100000;
    const max = 999999;
    const otp = Math.floor(Math.random() * (max - min + 1)) + min;
    // Convert the number to a string and pad it with leading zeros if necessary
    const otpString = otp.toString().padStart(6, '0');
    await this.cache.set(userId, otpString, 240); //ttl in seconds, expires in 4min
    return otpString;
  };

  public async isOtpValid({ otp, key }: VerifyOtpParams) {
    const otpMetaDataInCacheString: string = await this.cache.get(key);

    if (otpMetaDataInCacheString == otp) {
      this.cache.del(key);
      return true;
    }

    return false;
  }
}
