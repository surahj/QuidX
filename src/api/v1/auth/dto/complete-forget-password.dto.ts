import { IsJWT, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from '@common/decorators/match.decorator';

export class CompleteForgetPasswordDto {
  @ApiProperty()
  @IsJWT()
  token: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @Match('password', {
    message: 'Password and confirm password must match',
  })
  confirmPassword: string;
}
