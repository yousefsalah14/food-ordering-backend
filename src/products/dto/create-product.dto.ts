import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Margherita Pizza' })
  @IsString()
  @IsNotEmpty()
  nameEn!: string;

  @ApiProperty({ example: 'بيتزا مارجريتا' })
  @IsString()
  @IsNotEmpty()
  nameAr!: string;

  @ApiPropertyOptional({ example: 'Classic pizza with cheese' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ example: 'بيتزا كلاسيك بالجبنة' })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiProperty({ example: 250 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ example: 'd290f1ee-6c54-4b01-90e6-d701748f0851' })
  @IsUUID()
  categoryId!: string;

  @ApiPropertyOptional({ example: '/uploads/products/pizza.png' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
