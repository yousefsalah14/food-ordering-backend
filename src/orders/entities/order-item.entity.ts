import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { BaseAppEntity } from '../../utils/baseEntity';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem extends BaseAppEntity {
  @ApiProperty({ example: 'Margherita Pizza' })
  @Column()
  snapshotNameEn!: string;

  @ApiProperty({ example: 'بيتزا مارجريتا' })
  @Column()
  snapshotNameAr!: string;

  @ApiProperty({ example: 2 })
  @Column()
  quantity!: number;

  @ApiProperty({ example: 250 })
  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice!: number;

  @ApiProperty({ example: 500 })
  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice!: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @ApiHideProperty()
  order!: Order;

  @ManyToOne(() => Product, (product) => product.orderItems, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @ApiHideProperty()
  product!: Product;
}
