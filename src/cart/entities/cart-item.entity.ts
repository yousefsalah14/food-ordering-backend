import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { BaseAppEntity } from '../../utils/baseEntity';
import { Cart } from './cart.entity';

@Entity('cart_items')
export class CartItem extends BaseAppEntity {
  @ApiProperty({ example: 2 })
  @Column({ default: 1 })
  quantity!: number;

  @ApiProperty({ example: 250 })
  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice!: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @ApiHideProperty()
  cart!: Cart;

  @ManyToOne(() => Product, (product) => product.cartItems, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @ApiHideProperty()
  product!: Product;
}
