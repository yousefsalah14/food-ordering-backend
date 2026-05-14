import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../common/enums/order-status.enum';

export class UpdateOrderDto {
  @ApiProperty({ enum: OrderStatus, enumName: 'OrderStatus' })
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}
