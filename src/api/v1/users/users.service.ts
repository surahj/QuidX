import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User, Prisma } from '@prisma/postgres/client';
import { ErrorResponse } from '@common/errors';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  public async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.usersRepository.create({
      data,
    }) as Promise<User>;
  }

  public async getUserById(id: string): Promise<User> {
    return this.usersRepository.findById(id);
  }

  public async updateUser(
    payload: UpdateUserDto,
    userSession: { id: string; email: string },
  ): Promise<User> {
    const user = await this.getUserByEmail(userSession.email);

    if (user == null) {
      throw new ErrorResponse('Invalid credentials', 400);
    }

    return await this.usersRepository.update({
      data: {
        phoneNumber: payload.phoneNumber,
      },
      where: {
        id: user.id,
      },
    });
  }

  public async getUserByEmail(email: string): Promise<User> {
    return this.usersRepository.find({
      where: { email },
    }) as Promise<User>;
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
}
