import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateChatDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  chatId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question: string;
}
