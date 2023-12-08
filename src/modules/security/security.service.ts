import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { TokenType } from '@common/enums';
import {
  GenerateTokenOptions,
  TokenData,
  VerifyTokenOptions,
} from './security.interface';
import { ErrorResponse } from '@common/errors';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(private readonly jwtService: JwtService) {}

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
}
