import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { PaymentMethod } from '../../common/enums/payment-method.enum';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { User } from '../../users/entities/user.entity';
import { BaseAppEntity } from '../../utils/baseEntity';
import { Payment } from '../../payments/entities/payment.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order extends BaseAppEntity {
  @ApiProperty({ enum: OrderStatus, enumName: 'OrderStatus' })
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @ApiProperty({ enum: PaymentMethod, enumName: 'PaymentMethod' })
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH_ON_DELIVERY,
  })
  paymentMethod!: PaymentMethod;

  @ApiProperty({ example: 500 })
  @Column('decimal', { precision: 10, scale: 2 })
  subtotal!: number;

  @ApiProperty({ example: 500 })
  @Column('decimal', { precision: 10, scale: 2 })
  total!: number;

  @ApiProperty({ example: 'Cairo, Egypt' })
  @Column()
  shippingAddress!: string;

  @ApiProperty({ example: 'Call before delivery', required: false })
  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @ApiProperty({ example: 'SUMMER24', required: false })
  @Column({ type: 'varchar', nullable: true })
  couponCode?: string | null;

  @ManyToOne(() => User, (user) => user.orders, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @ApiHideProperty()
  user!: User;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
  })
  @ApiHideProperty()
  items!: OrderItem[];

  @OneToOne(() => Payment, (payment) => payment.order)
  @ApiHideProperty()
  payment?: Payment;
}
