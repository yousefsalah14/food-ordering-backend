import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { BaseAppEntity } from '../../utils/baseEntity';

@Entity('products')
export class Product extends BaseAppEntity {
  @ApiProperty({ example: 'Margherita Pizza' })
  @Column()
  nameEn!: string;

  @ApiProperty({ example: 'بيتزا مارجريتا' })
  @Column()
  nameAr!: string;

  @ApiProperty({ example: 'Classic pizza with cheese', required: false })
  @Column({ type: 'text', nullable: true })
  descriptionEn?: string | null;

  @ApiProperty({ example: 'بيتزا كلاسيك بالجبنة', required: false })
  @Column({ type: 'text', nullable: true })
  descriptionAr?: string | null;

  @ApiProperty({ example: 250 })
  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isAvailable!: boolean;

  @ApiProperty({ example: '/uploads/products/pizza.png', required: false })
  @Column({ type: 'varchar', nullable: true })
  imageUrl?: string | null;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @ApiHideProperty()
  category!: Category;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  @ApiHideProperty()
  cartItems!: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  @ApiHideProperty()
  orderItems!: OrderItem[];
}
