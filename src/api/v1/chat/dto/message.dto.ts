import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class messageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;
}
