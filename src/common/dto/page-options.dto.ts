import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { RemoveQuotes } from '../decorators/remove-quotes.decorator';

export enum SORT_ORDER {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PageOptionsDto {
  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  readonly take: number = 20;

  @ApiPropertyOptional({
    enum: SORT_ORDER,
  })
  @IsOptional()
  @IsEnum(SORT_ORDER)
  sortDir = SORT_ORDER.DESC;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly sortBy: string = 'createdAt';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @RemoveQuotes()
  readonly searchTerm?: string;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
