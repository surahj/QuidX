import { SignUpDto } from './dto/signup.dto';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { TokenService } from './services/token.services';

@ApiTags('Authentications Manager.')
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
}
