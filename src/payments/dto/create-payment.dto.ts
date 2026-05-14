import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 'd290f1ee-6c54-4b01-90e6-d701748f0851' })
  @IsUUID()
  orderId!: string;

  @ApiPropertyOptional({ example: 'http://localhost:5173/payment/success' })
  @IsOptional()
  @IsUrl({
    require_tld: false,
    require_protocol: true,
  })
  successUrl?: string;

  @ApiPropertyOptional({ example: 'http://localhost:5173/payment/cancel' })
  @IsOptional()
  @IsUrl({
    require_tld: false,
    require_protocol: true,
  })
  cancelUrl?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  locale?: string;
}
