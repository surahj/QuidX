import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User, Prisma, Profile, Guest } from '@prisma/postgres/client';
import { ErrorResponse } from '@common/errors';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  public async createUser(
    data: Prisma.UserCreateInput,
  ): Promise<User & { profile: Profile }> {
    return this.usersRepository.create({
      data,
      include: {
        profile: true,
      },
    }) as Promise<User & { profile: Profile }>;
  }

  public async createGuest(data: Prisma.GuestCreateInput): Promise<Guest> {
    return this.usersRepository.createGuest({
      data,
    }) as Promise<Guest>;
  }

  public async getUserById(id: string): Promise<User & { profile: Profile }> {
    return this.usersRepository.findById(id, { includeProfile: true });
  }

  public async getUserByEmail(
    email: string,
  ): Promise<User & { profile: Profile }> {
    return this.usersRepository.find({
      where: { email },
      include: {
        profile: true,
      },
    }) as Promise<User & { profile: Profile }>;
  }

  public async getUserByIdAndUpdate(
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return this.usersRepository.update({
      where: { id },
      data,
    }) as Promise<User>;
  }

  public async updateUserProfile(
    id: string,
    data: UpdateUserDto,
  ): Promise<Profile> {
    return this.usersRepository.findUserProfileByIdAndUpdate(
      id,
      data,
    ) as Promise<Profile>;
  }

  public async getUserProfile(id: string): Promise<Profile[]> {
    return this.usersRepository.getUserProfile(id) as Promise<Profile[]>;
  }
}
