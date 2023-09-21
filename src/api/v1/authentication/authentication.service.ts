import { Injectable, Logger } from '@nestjs/common';
import { ErrorResponse } from '@common/errors';
import { SecurityService } from '@modules/security/security.service';
import { UserSignUpDataDto } from './dto/signup.dto';
import { UsersService } from '@api/v1/users/users.service';
import { loginDto } from './dto/login.dto';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly securityService: SecurityService,
  ) {}

  public async signUpUser(payload: UserSignUpDataDto) {
    const existingUserWithEmail = await this.usersService.getUserByEmail(
      payload.email,
    );

    if (existingUserWithEmail) {
      throw new ErrorResponse('user with email already exists', 400);
    }

    const hashedPassword = await this.securityService.hashPassword(
      payload.password,
    );

    return await this.usersService.createUser({
      email: payload.email,
      password: hashedPassword,
      fullName: payload.fullName,
    });
  }

  public async loginUser(payload: loginDto) {
    const user = await this.usersService.getUserByEmail(payload.email);
    console.log(user);

    if (!user) {
      throw new ErrorResponse('Invalid credentials', 400);
    }

    const passwordMatch = await this.securityService.verifyPassword(
      payload.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new ErrorResponse('Incorrect credentials', 400);
    }

    return user;
  }
}
