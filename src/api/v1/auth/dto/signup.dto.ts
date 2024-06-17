import { Match } from '@common/decorators/match.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class SignUpDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(/(?=.*?[A-Z])/, {
    message: 'Password must contain at least one uppercase',
  })
  @Matches(/(?=.*?[a-z])/, {
    message: 'Password must contain at least one lowercase',
  })
  @Matches(/(?=.*?[0-9])/, {
    message: 'Password must contain at least one digit',
  })
  @Matches(/(?=.*?[ #?!@$%^&*-.])/, {
    message: 'Password must contain at least one special character',
  })
  @Matches(/.{8,}/, {
    message: 'Password must contain at least 8 digits',
  })
  password: string;

  @ApiProperty()
  @IsString()
  @Match('password', {
    message: 'Password and confirm password must match',
  })
  confirmPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;
}
