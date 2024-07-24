import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUrl } from 'class-validator';

export class ForgetPasswordBeginDto {
  @ApiProperty({
    description: 'user email',
  })
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsUrl()
  callbackUrl: string;
}
