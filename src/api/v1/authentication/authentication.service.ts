import { Injectable, Logger, Inject } from '@nestjs/common';
import { ErrorResponse } from '@common/errors';
import { SecurityService } from '@modules/security/security.service';
import { UserSignUpDataDto } from './dto/signup.dto';
import { UsersService } from '@api/v1/users/users.service';
import { loginDto, ForgotPasswordDto } from './dto';
import { TokenType } from '@common/enums';
import { EmailService } from '@modules/emails/email.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly securityService: SecurityService,
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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
      firstName: payload.firstName,
      lastName: payload.lastName,
    });
  }

  public async loginUser(payload: loginDto) {
    const user = await this.usersService.getUserByEmail(payload.email);

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

  public async forgotPasswordInit({
    email,
  }: ForgotPasswordDto): Promise<string> {
    const user = await this.usersService.getUserByEmail(email);

    if (user == null) {
      throw new ErrorResponse('Invalid credentials', 400);
    }

    const token = await this.securityService.generateOTP(user.id);

    await this.emailService.sendOtpToEmail({
      email,
      username: user.firstName,
      token,
    });

    const _2FAToken = await this.securityService.generateToken(
      {
        id: user.id,
        role: user.role,
        tokenType: TokenType.MFA,
      },
      { expiresIn: '8m' },
    );

    return _2FAToken;
  }

  public async forgotPassword2FA(args: {
    _2FAToken: string;
    otp: string;
  }): Promise<string> {
    const { _2FAToken, otp } = args;

    const tokenData = await this.securityService.verifyToken(
      _2FAToken,
      TokenType.MFA,
    );

    const isOtpValid = await this.securityService.isOtpValid({
      otp,
      key: tokenData.id,
    });

    if (!isOtpValid) {
      throw new ErrorResponse('Invalid Otp', 400);
    }

    const resetToken = await this.securityService.generateToken({
      id: tokenData.id,
      accountType: tokenData.accountType,
      tokenType: TokenType.RESET_PASSWORD,
    });

    return resetToken;
  }

  public async resetPassword(args: {
    newPassword: string;
    resetToken: string;
  }) {
    const { newPassword, resetToken } = args;

    const tokenData = await this.securityService.verifyToken(
      resetToken,
      TokenType.RESET_PASSWORD,
    );

    const newHashedPassword = await this.securityService.hashPassword(
      newPassword,
    );

    const user = await this.usersService.getUserByIdAndUpdate(tokenData.id, {
      password: newHashedPassword,
    });

    if (user == null) {
      throw new ErrorResponse('Something went wrong', 500);
    }
  }
}
