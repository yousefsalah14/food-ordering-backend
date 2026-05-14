import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class QueryProductsDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ example: 24, default: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  @Max(500)
  limit = 10;

  @ApiPropertyOptional({ example: 'pizza' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Margherita Pizza' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ example: 'بيتزا مارجريتا' })
  @IsOptional()
  @IsString()
  nameAr?: string;

  @ApiPropertyOptional({ example: 'Classic pizza' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ example: 'بيتزا كلاسيك' })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional({ example: 'd290f1ee-6c54-4b01-90e6-d701748f0851' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ example: true })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @Type(() => Number)
  @IsOptional()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 500 })
  @Type(() => Number)
  @IsOptional()
  @Max(1000000)
  maxPrice?: number;
}
