import {
  Body,
  Controller,
  Logger,
  Post,
  Req,
  InternalServerErrorException,
  Get,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import {
  UserSignUpDataDto,
  loginDto,
  ResetPasswordDto,
  ForgotPasswordDto,
} from './dto';
import { Request } from 'express';
import { Otp2FADto } from './dto/verification.dto';

@ApiTags('Authentication')
@Controller('v1/authentication')
export class AuthenticationController {
  private readonly logger = new Logger(AuthenticationController.name);

  private createSession(req: Request) {
    return (sessionUser: { id: string; email: string; role: string }) => {
      req.session['user'] = sessionUser;

      req.session.save((err) => {
        if (err != null) {
          this.logger.error(err);
          throw new InternalServerErrorException('error creating session');
        }
      });
    };
  }

  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('user/signup')
  @ApiBody({
    type: UserSignUpDataDto,
  })
  public async signUpUser(@Body() payload: UserSignUpDataDto) {
    await this.authenticationService.signUpUser(payload);

    return { statusCode: 200, message: 'success' };
  }

  @Post('user/login')
  public async loginUser(@Req() req: Request, @Body() payload: loginDto) {
    console.log(payload);
    const user = await this.authenticationService.loginUser(payload);
    console.log(user);

    this.createSession(req)({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { statusCode: 200, message: 'success', data: { id: user.id } };
  }

  @Post('forgot-password')
  public async forgotPassword(@Body() { email }: ForgotPasswordDto) {
    const _2FAToken = await this.authenticationService.forgotPasswordInit({
      email,
    });

    return {
      statusCode: 200,
      message: 'success',
      data: { _2FAToken },
    };
  }

  @Post('forgot-password/2fa')
  public async forgotPassword2FA(@Body() payload: Otp2FADto) {
    const resetToken = await this.authenticationService.forgotPassword2FA({
      _2FAToken: payload._2FAToken,
      otp: payload.otp,
    });

    return { statusCode: 200, message: 'success', data: { resetToken } };
  }

  @Post('reset-password')
  public async resetPassword(@Body() payload: ResetPasswordDto) {
    await this.authenticationService.resetPassword({
      newPassword: payload.newPassword,
      resetToken: payload.resetToken,
    });

    return { statusCode: 200, message: 'success' };
  }

  @Get('logout')
  public async logout(@Req() req: Request) {
    req.session.destroy((err) => {
      if (err) {
        this.logger.error(err);
        throw new InternalServerErrorException('error creating session');
      }
    });
  }
}
