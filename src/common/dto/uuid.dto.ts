import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ObjectIdDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    example: 'bc98036c-1dd0-4784-aa87-7b14730eca6b',
    required: true,
  })
  @IsUUID()
  id: string;
}
