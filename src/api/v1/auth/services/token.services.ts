import { Injectable } from '@nestjs/common';
import { PostgresPrismaService } from '@database/postgres-prisma.service';
import { Prisma } from '@prisma/postgres/client';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
  constructor(private readonly postgresPrismaService: PostgresPrismaService) {}

  private hashRefreshToken(refreshToken: string): string {
    const hash = crypto.createHash('sha256');
    return hash.update(refreshToken).digest('hex');
  }

  public async create(query: Prisma.TokenCreateArgs) {
    return this.postgresPrismaService.token.create(query);
  }

  public async upsert(query: Prisma.TokenUpsertArgs) {
    return this.postgresPrismaService.token.upsert(query);
  }

  public async createRefreshToken(tokenData: {
    token: string;
    userId: string;
    expiryDate?: Date;
  }) {
    const hashedRefreshToken = this.hashRefreshToken(tokenData.token);

    return await this.create({
      data: {
        hashedToken: hashedRefreshToken,
        user: { connect: { id: tokenData.userId } },
      },
    });
  }

  public async find(query: Prisma.TokenFindFirstArgs) {
    return this.postgresPrismaService.token.findFirst(query);
  }

  public async findTokenByUserId(userId: string) {
    return this.postgresPrismaService.token.findUnique({
      where: { userId },
    });
  }

  // public async isRefreshTokenMatch(refreshToken: string) {
  //   await this.hashRefreshToken
  // }

  // public async delete(query: Prisma.UserDeleteArgs) {
  //   return this.postgresPrismaService.user.delete(query);
  // }

  public async update(query: Prisma.TokenUpdateArgs) {
    return this.postgresPrismaService.token.update(query);
  }
}
