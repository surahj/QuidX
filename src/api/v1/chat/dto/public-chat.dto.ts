import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PublicChatDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question: string;
}
