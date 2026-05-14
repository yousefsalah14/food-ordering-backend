import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { PaymentMethod } from '../../common/enums/payment-method.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { BaseAppEntity } from '../../utils/baseEntity';
import { Order } from '../../orders/entities/order.entity';

@Entity('payments')
export class Payment extends BaseAppEntity {
  @ApiProperty({ enum: PaymentMethod, enumName: 'PaymentMethod' })
  @Column({ type: 'enum', enum: PaymentMethod })
  method!: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus, enumName: 'PaymentStatus' })
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @ApiProperty({ example: 500 })
  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @ApiProperty({ example: 'txn_123', required: false })
  @Column({ type: 'varchar', nullable: true })
  transactionId?: string | null;

  @ApiProperty({ example: 'cs_test_a1b2c3', required: false })
  @Column({ type: 'varchar', nullable: true })
  checkoutSessionId?: string | null;

  @ApiProperty({ example: 'pi_123', required: false })
  @Column({ type: 'varchar', nullable: true })
  paymentIntentId?: string | null;

  @ApiProperty({ example: 'egp' })
  @Column({ default: 'egp' })
  currency!: string;

  @OneToOne(() => Order, (order) => order.payment, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @ApiHideProperty()
  order!: Order;
}
