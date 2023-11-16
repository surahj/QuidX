import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/signup.dto';
import { User } from '@prisma/postgres/client';
import { UsersService } from '../../users/users.service';
import { ErrorResponse } from '@common/errors';
import * as bcrypt from 'bcrypt';
import { BcryptService } from '@common/helpers/bcrypt.service';
import { LoginDto } from '../dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

  async getCookieWithJwtAccessToken(payload: { id: string; email: string }) {
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}`,
    });
    const cookie = `Authentication=${token}; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=${this.configService.get(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    )}`;
    console.log('cookie', cookie);
    return { cookie, token };
  }

  async getCookieWithJwtRefreshToken(payload: { id: string; email: string }) {
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}`,
    });
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    )}`;
    return { cookie, token };
  }

  public getCookiesForLogOut() {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      // 'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
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

  // async login(user: LoginDto) {
  //   const loginUser = await this.validateUser(user.email, user.password);
  //   if (loginUser) {
  //     const payload = { email: loginUser.email, sub: loginUser.id };
  //     return { accessToken: this.jwtService.sign(payload) };
  //   }
  // }

  async validateUserPayload(payload): Promise<User> {
    const user: User = await this.userService.getUserById(payload.id);
    if (user?.id == payload.id && user?.email == payload.email) {
      return user;
    }
  }
}
