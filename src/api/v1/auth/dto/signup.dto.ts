import { Match } from '@common/decorators/match.decorator';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  @MaxLength(120)
  @MinLength(8)
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
