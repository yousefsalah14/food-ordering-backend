import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';

export class QueryCategoriesDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  @Max(100)
  limit = 10;

  @ApiPropertyOptional({ example: 'pizza' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Pizza' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ example: 'بيتزا' })
  @IsOptional()
  @IsString()
  nameAr?: string;

  @ApiPropertyOptional({ example: 'Freshly baked' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ example: 'طازجة' })
  @IsOptional()
  @IsString()
  descriptionAr?: string;
}
