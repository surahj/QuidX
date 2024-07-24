import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from '../dto/signup.dto';
import { User, Profile, Token } from '@prisma/postgres/client';
import { UsersService } from '../../users/users.service';
import { ErrorResponse } from '@common/errors';
import * as bcrypt from 'bcrypt';
import { BcryptService } from '@common/helpers/bcrypt.service';
import { LoginDto } from '../dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@modules/emails/email.service';
import { generateConfirmationCode } from '../utils/confirmationCode';
import { TokenService } from './token.services';
import { minutesFromNow } from '../utils/timeUtils';
import { ERROR } from '../error';
import { ResendTokenDto, ResetPasswordDto } from '../dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UsersService,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
  ) {}

  private async compare(str1, str2) {
    if (!str1 || !str2) return false;
    return bcrypt.compare(str1, str2);
  }

  async validateUser(email: string, password: string): Promise<User> {
    this.logger.log('validating user');
    const user = await this.userService.getUserByEmail(email?.toLowerCase());
    const mismatch = !(await this.compare(password, user?.password));

    if (!user || mismatch) return null;
    return user;
  }

  async getJwtAccessToken(payload: { id: string; email: string }) {
    this.logger.log('get JWT Access Token');
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}s`,
    });
    return token;
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

  async resendToken({ email, callbackUrl }: ResendTokenDto) {
    this.logger.log('resend token');
    const user = await this.userService.getUserByEmail(email);
    if (!user) throw new NotFoundException(ERROR.EMAIL_NOT_FOUND);

    this.generateUserConfirmation(user, callbackUrl);
  }

  async signUp(user: SignUpDto): Promise<User> {
    const { callbackUrl } = user;
    user.email = String(user.email).toLowerCase();
    const existingUserWithEmail = await this.userService.getUserByEmail(
      user.email,
    );

    if (existingUserWithEmail) {
      throw new ErrorResponse('user with email already exists', 400);
    }

    const hashedPassword = await this.bcryptService.hash(user.password);

    const createdUser = await this.userService.createUser({
      email: user.email,
      password: hashedPassword,
      profile: {
        create: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    });

    if (createdUser) {
      this.generateUserConfirmation(createdUser, callbackUrl);
      return createdUser;
    } else {
      throw new ConflictException(ERROR.USER_NOT_CREATED);
    }
  }

  async generateUserConfirmation(
    createdUser: User & { profile: Profile },
    callbackUrl: string,
  ) {
    this.logger.log('Generate user confirmation token and send to email');
    const token = generateConfirmationCode();
    const tokenData: Token = await this.tokenService.createToken({
      token: token,
      expiryDate: minutesFromNow(30),
      userId: createdUser.id,
    });
    try {
      this.emailService.sendEmailWelcome({
        email: createdUser.email,
        username: createdUser.profile.firstName,
        token: tokenData.token,
        callbackUrl,
      });
    } catch (error) {
      this.logger.log(error.message);
    }
  }
  // async login(user: LoginDto) {
  //   const loginUser = await this.validateUser(user.email, user.password);
  //   if (loginUser) {
  //     const payload = { email: loginUser.email, sub: loginUser.id };
  //     return { accessToken: this.jwtService.sign(payload) };
  //   }
  // }

  async validateUserPayload(payload): Promise<User> {
    this.logger.log('Validate user payload');
    const user: User = await this.userService.getUserById(payload.id);
    if (user?.id == payload.id && user?.email == payload.email) {
      return user;
    }
  }

  async verify(tokenStr: string): Promise<void> {
    this.logger.log('verify token....');
    const token = await this.tokenService.findTokenByTokenStr(tokenStr);

    if (!token || new Date().getTime() > token.expiryDate.getTime()) {
      throw new BadRequestException('Invalid token or token expired');
    }
    if (token.user.isEmailVerified === true)
      throw new BadRequestException('Account already verified');

    await this.userService.getUserByIdAndUpdate(token.user.id, {
      isEmailVerified: true,
    });

  }

  async forgetPasswordBegin(email: string, callbackUrl: string) {
    this.logger.log('forget password begin...');
    const user = await this.userService.getUserByEmail(email);
    if (!user) throw new NotFoundException(ERROR.EMAIL_NOT_FOUND);
    const token = await this.jwtService.signAsync(
      { id: user.id },
      {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: 1800, // expires in 30 min (300 seconds)
      },
    );
    const tokenData: Token = await this.tokenService.createToken({
      token,
      userId: user.id,
      expiryDate: minutesFromNow(30),
    });
    try {
      await this.emailService.sendEmailToResetPassword({
        email: user.email,
        username: user.profile.firstName,
        token: tokenData.token,
        callbackUrl,
      });
      return token;
    } catch (err) {
      this.logger.error(err.message);
      throw new HttpException(
        {
          error: 'error reseting password',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyAndGetUserFromToken(tokenStr: string): Promise<User | undefined> {
    this.logger.log('verify and get user from token');
    const tokenExist = await this.tokenService.findTokenByTokenStr(tokenStr);
    if (!tokenExist) throw new UnauthorizedException(ERROR.TOKEN_NOT_FOUND);

    if (new Date().getTime() > tokenExist.expiryDate.getTime()) {
      // return ERROR.VERIFICATION_LINK_EXPIRED;
      throw new UnauthorizedException(ERROR.TOKEN_EXPIRED);
    }
    const decoded = await this.jwtService.verifyAsync(tokenStr, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
    return this.userService.getUserById(decoded.id);
  }

  async completeForgetPassword(data: any) {
    this.logger.log('complete forget password');
    const user: User = await this.verifyAndGetUserFromToken(data.token);
    //TODO -> check if  there is a possibility that a token will exist without a user
    const hashPassword = await this.bcryptService.hash(data.password);
    await this.userService.getUserByIdAndUpdate(user.id, {
      password: hashPassword,
    });
  }

  async resetPassword(data: ResetPasswordDto, user: User) {
    const { newPassword, currentPassword } = data;
    //first of all compare if  password matches
    if (!(await this.validateUser(user?.email, currentPassword))) {
      throw new UnauthorizedException(ERROR.INVALID_CREDENTIALS);
    }

    const hashPassword = await this.bcryptService.hash(newPassword);
    await this.userService.getUserByIdAndUpdate(user.id, {
      password: hashPassword,
    });
  }
}
