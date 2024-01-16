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
} from './dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { TokenService } from './services/token.services';
import { JwtAuthGuard } from './guards/jwt.guard';

@ApiTags('Authentications Manager')
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
  @UseInterceptors(ClassSerializerInterceptor)
  async login(@Body() data: LoginDto, @Req() req) {
    const user = req.user;
    const payload = { id: user.id, email: user.email };
    const accessToken = await this.authService.getJwtAccessToken(payload);

    // const refreshTokenCookie =
    //   await this.authService.getCookieWithJwtRefreshToken(payload);

    // const tokenData = { token: refreshTokenCookie.token, userId: user.id };
    // await this.tokenService.createRefreshToken(tokenData);
    await req.res.setHeader('Authorization', `Bearer ${accessToken}`);

    return {
      message: 'User login successful',
      statusCode: 200,
      token: accessToken,
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
  @UseInterceptors(ClassSerializerInterceptor)
  async verify(@Req() req: Request, @Res() res, @Param('token') token: string) {
    const status = await this.authService.verify(token);
    res.send(`<p>${status}</p>`);
  }

  @ApiOperation({ summary: 'send confirmation mail' })
  @ApiBearerAuth('Bearer')
  @UseGuards(JwtAuthGuard)
  @Post('/createConfirmation')
  @ApiResponse({
    status: 200,
    description: 'verification mail sent successfully',
  })
  async resendConfirmationToken(@Req() req) {
    await this.authService.generateUserConfirmation(req?.user);
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
}
