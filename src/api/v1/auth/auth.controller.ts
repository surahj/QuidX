import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserSignUpDataDto } from '../authentication/dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Authentication Manager')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  // @UseInterceptors(ClassSerializerInterceptor)
  async login(@Body() data: LoginDto) {
    console.log('login...');
    return this.authService.login(data);
  }
}
