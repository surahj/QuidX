import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateChatDto {
  @ApiProperty({ required: false, description: 'Optional chat ID' })
  @IsString()
  @IsOptional()
  chatId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question: string;
}
