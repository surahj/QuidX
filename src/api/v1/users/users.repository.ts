import { Injectable } from '@nestjs/common';
import { PostgresPrismaService } from '@database/postgres-prisma.service';
import { Prisma } from '@prisma/postgres/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly postgresPrismaService: PostgresPrismaService) {}

  public async create(query: Prisma.UserCreateArgs) {
    return this.postgresPrismaService.user.create(query);
  }

  public async find(query: Prisma.UserFindFirstArgs) {
    return this.postgresPrismaService.user.findFirst(query);
  }

  public async findById(id: string) {
    return this.postgresPrismaService.user.findUnique({
      where: { id },
    });
  }

  // public async delete(query: Prisma.UserDeleteArgs) {
  //   return this.postgresPrismaService.user.delete(query);
  // }

  public async update(query: Prisma.UserUpdateArgs) {
    return this.postgresPrismaService.user.update(query);
  }
}
