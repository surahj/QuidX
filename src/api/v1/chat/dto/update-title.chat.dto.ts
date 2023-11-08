import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateChatTitleDto {
  @ApiProperty()
  @IsString()
  title: string;
}
