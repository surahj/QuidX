import {
  Body,
  Controller,
  Logger,
  Post,
  Req,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { UserSignUpDataDto, loginDto } from './dto';
import { Request } from 'express';

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
}
