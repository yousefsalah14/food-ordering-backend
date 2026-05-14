import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentMethod } from '../../common/enums/payment-method.enum';

export class CreateOrderDto {
  @ApiProperty({ enum: PaymentMethod, enumName: 'PaymentMethod' })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiProperty({ example: 'Cairo, Egypt' })
  @IsString()
  @IsNotEmpty()
  shippingAddress!: string;

  @ApiPropertyOptional({ example: 'Call before delivery' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'SUMMER24' })
  @IsOptional()
  @IsString()
  couponCode?: string;
}
