import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateChatDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question: string;
}
