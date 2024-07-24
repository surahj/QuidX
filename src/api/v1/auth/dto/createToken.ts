import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateToken {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  expiryDate: Date;

  @IsNotEmpty()
  userId: string;
}

export class ResendTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  callbackUrl: string;
}
