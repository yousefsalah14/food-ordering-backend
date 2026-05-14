import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

export class UpdatePaymentDto {
  @ApiProperty({ enum: PaymentStatus, enumName: 'PaymentStatus' })
  @IsEnum(PaymentStatus)
  status!: PaymentStatus;

  @ApiPropertyOptional({ example: 'txn_123' })
  @IsOptional()
  @IsString()
  transactionId?: string;
}
