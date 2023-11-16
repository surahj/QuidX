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
import { UserSignUpDataDto } from '../authentication/dto';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { TokenService } from './services/token.services';

@ApiTags('Authentication Manager')
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
    type: UserSignUpDataDto,
  })
  public async signUpUser(@Body() payload: UserSignUpDataDto) {
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
    const accessTokenCookie =
      await this.authService.getCookieWithJwtAccessToken(payload);

    const refreshTokenCookie =
      await this.authService.getCookieWithJwtRefreshToken(payload);

    const tokenData = { token: refreshTokenCookie.token, userId: user.id };
    await this.tokenService.createRefreshToken(tokenData);
    await req.res.setHeader('Set-Cookie', [
      accessTokenCookie.cookie,
      // refreshTokenCookie.cookie,
    ]);
    return {
      accessToken: accessTokenCookie.token,
      // refreshToken: refreshTokenCookie.token,
    };
  }

  @Post('/signout')
  @ApiOperation({ summary: 'Clear user login details and logout' })
  @ApiResponse({ status: 200, description: 'Logout successufl' })
  async signout(@Req() req) {
    req.res.setHeader('Set-Cookie', this.authService.getCookiesForLogOut());
  }
}
