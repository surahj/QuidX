import { Injectable } from '@nestjs/common';
import { PostgresPrismaService } from '@database/postgres-prisma.service';
import { Prisma } from '@prisma/postgres/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly postgresPrismaService: PostgresPrismaService) {}

  public async create(query: Prisma.UserCreateArgs) {
    return this.postgresPrismaService.user.create(query);
  }

  public async createGuest(query: Prisma.GuestCreateArgs) {
    return this.postgresPrismaService.guest.create(query);
  }

  public async find(query: Prisma.UserFindFirstArgs) {
    return this.postgresPrismaService.user.findFirst(query);
  }

  public async findGuest(query: Prisma.GuestFindFirstArgs) {
    return this.postgresPrismaService.guest.findFirst(query);
  }

  public async findById(
    id: string,
    options?: Partial<{
      /**  if `true` include profile from profile table that is related to this user (default is `false`)  */
      includeProfile: boolean;
    }>,
  ) {
    return this.postgresPrismaService.user.findUnique({
      where: { id },
      include: {
        profile: options?.includeProfile || false,
      },
    });
  }

  // public async delete(query: Prisma.UserDeleteArgs) {
  //   return this.postgresPrismaService.user.delete(query);
  // }

  public async update(query: Prisma.UserUpdateArgs) {
    return this.postgresPrismaService.user.update(query);
  }

  public async findUserProfileByIdAndUpdate(
    id: string,
    data: Prisma.ProfileUpdateInput,
    options?: Partial<{
      /**  if `true` include user from users table that is related to this profile (default is `false`)  */
      includeUser: boolean;
    }>,
  ) {
    return this.postgresPrismaService.profile.update({
      where: { id },
      data,
      include: {
        user: options?.includeUser || false,
      },
    });
  }

  public async getUserProfile(
    id: string,
    options?: Partial<{
      /**  if `true` include user from users table that is related to this profile (default is `false`)  */
      includeUser: boolean;
    }>,
  ) {
    return this.postgresPrismaService.profile.findMany({
      where: { id },
      include: {
        user: options?.includeUser || false,
      },
    });
  }
}
