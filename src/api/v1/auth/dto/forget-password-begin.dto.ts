import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ForgetPasswordBeginDto {
  @ApiProperty({
    description: 'user email',
  })
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  callbackUrl: string;
}
