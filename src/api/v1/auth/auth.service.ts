import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/signup.dto';
import { User } from '@prisma/postgres/client';
import { UsersService } from '../users/users.service';
import { ErrorResponse } from '@common/errors';
import * as bcrypt from 'bcrypt';
import { BcryptService } from '@common/helpers/bcrypt.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly bcryptService: BcryptService,
    private jwtService: JwtService,
  ) {}

  private async compare(str1, str2) {
    if (!str1 || !str2) return false;
    return bcrypt.compare(str1, str2);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.getUserByEmail(email?.toLowerCase());
    const mismatch = !(await this.compare(password, user?.password));

    if (!user || mismatch) return null;
    return user;
  }

  async signUp(user: CreateUserDto): Promise<User> {
    user.email = String(user.email).toLowerCase();
    const existingUserWithEmail = await this.userService.getUserByEmail(
      user.email,
    );

    if (existingUserWithEmail) {
      throw new ErrorResponse('user with email already exists', 400);
    }

    const hashedPassword = await this.bcryptService.hash(user.password);

    return await this.userService.createUser({
      email: user.email,
      password: hashedPassword,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }

  async login(user: LoginDto) {
    const loginUser = await this.validateUser(user.email, user.password);
    if (loginUser) {
      const payload = { email: loginUser.email, sub: loginUser.id };
      return { accessToken: this.jwtService.sign(payload) };
    }
  }

  async validateUserPayload(payload): Promise<User> {
    const user: User = await this.userService.getUserById(payload.sub);
    if (user?.id == payload.sub && user?.email == payload.email) {
      return user;
    }
  }
}
