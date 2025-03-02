import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import {
  CompleteForgetPasswordDto,
  ForgetPasswordBeginDto,
  LoginDto,
  SignUpDto,
  ResetPasswordDto,
  ResendTokenDto,
} from './dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { TokenService } from './services/token.services';
import { JwtAuthGuard } from './guards/jwt.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@ApiTags('Authentications Manager')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @ApiResponse({
    status: 200,
    // description: 'Confirmation email Sent',
  })
  @ApiOperation({ summary: 'Sign up on QuidX' })
  @Post('/signup')
  @ApiBody({
    type: SignUpDto,
  })
  public async signUpUser(@Body() payload: SignUpDto) {
    const userCreated = await this.authService.signUp(payload);

    return { id: userCreated.id, email: userCreated.email };
  }

  @ApiResponse({
    status: 200,
    description: 'Login successfully',
  })
  @ApiOperation({ summary: 'Login to QuidX' })
  @Post('/login')
  @UseGuards(LocalAuthGuard)
  async login(@Body() data: LoginDto, @Req() req) {
    const { user } = req;
    const { token } = await this.authService.login(user);

    await req.res.setHeader('Authorization', `Bearer ${token}`);

    return {
      message: 'User login successful',
      statusCode: 200,
      token,
      data: { userId: user.id },
    };
  }

  @Post('/signout')
  @ApiOperation({ summary: 'Clear user login details and logout' })
  @ApiResponse({ status: 200, description: 'Logout successufl' })
  async signout(@Req() req) {
    await req.res.setHeader('Authorization', 'Bearer ');
    // await req.res.setHeader('Set-Cookie', this.authService.getCookiesForLogOut());
  }

  @ApiResponse({
    status: 200,
    description: 'User email has been verified',
  })
  @ApiOperation({ summary: 'Verify Email' })
  @Get('/verify/:token')
  async verify(@Param('token') token: string) {
    await this.authService.verify(token);
    return {
      meesage: 'User email has been verified',
    };
  }

  @ApiOperation({ summary: 'send confirmation mail' })
  @Post('/token/resend')
  @ApiResponse({
    status: 200,
    description: 'verification mail sent successfully',
  })
  async resendConfirmationToken(@Body() req: ResendTokenDto) {
    await this.authService.resendToken(req);
    return {
      message: 'verification mail sent successfully',
    };
  }

  @Post('/forgetpasswordbegin')
  @ApiOperation({ summary: 'Create password reset token' })
  @ApiResponse({ status: 200, description: 'Token successfully sent' })
  async forgetPasswordBegin(@Body() data: ForgetPasswordBeginDto) {
    const token = await this.authService.forgetPasswordBegin(
      data.email,
      data.callbackUrl,
    );

    return {
      statusCode: 200,
      message: 'Token successfully sent to email',
      data: { token },
    };
  }

  @Post('/user/completeforgetpassword')
  @ApiOperation({ summary: 'Complete updating user password' })
  @ApiResponse({ status: 200, description: 'User password updated' })
  async completeForgetPassword(@Body() data: CompleteForgetPasswordDto) {
    await this.authService.completeForgetPassword(data);

    return {
      statusCode: 200,
      message: 'User password reset successfully',
    };
  }

  @ApiOperation({ summary: 'reset user password' })
  @ApiBearerAuth('Bearer')
  @UseGuards(JwtAuthGuard)
  @Post('/user/reset')
  @ApiResponse({ status: 200, description: 'User password updated' })
  async resetPassword(@Body() data: ResetPasswordDto, @Req() req) {
    await this.authService.resetPassword(data, req?.user);
    return {
      statusCode: 200,
      message: 'password reset was successfull',
    };
  }

  @ApiOperation({ summary: 'signup/signin with google' })
  @ApiBearerAuth('Bearer')
  @UseGuards(GoogleAuthGuard)
  @Get('/google')
  async googleAuth(@Req() req) {
    // The user will be redirected to Google for authentication
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/google/callback')
  async googleAuthRedirect(@Req() req, @Res() res) {
    const appUrl = process.env.APP_URL;
    try {
      const { user } = req;
      const { token } = await this.authService.googleSignIn(user);

      res.redirect(`${appUrl}?token=${token}`);
    } catch (error) {
      res.redirect(`${appUrl}/error}`);
    }
  }
}
