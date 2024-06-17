import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsEmail,
  IsOptional,
} from 'class-validator';
import { Gender } from '@prisma/postgres/client';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ enum: Gender })
  @IsString()
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  // @ApiProperty()
  // @IsString()
  // avatar: string;

  // @ApiProperty({
  //   example: 'YYYY-MM-DD',
  // })
  // @IsString()
  // @IsNotEmpty()
  // dateOfBirth: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  stateOfResidence: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;
}

export class createGuestDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  message?: string;
}
