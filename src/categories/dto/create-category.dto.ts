import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Pizza' })
  @IsString()
  @IsNotEmpty()
  nameEn!: string;

  @ApiProperty({ example: 'بيتزا' })
  @IsString()
  @IsNotEmpty()
  nameAr!: string;

  @ApiPropertyOptional({ example: 'Freshly baked pizzas' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ example: 'بيتزا طازجة مخبوزة' })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional({ example: '/uploads/categories/pizza.png' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
