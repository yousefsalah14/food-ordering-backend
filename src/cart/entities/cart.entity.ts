import { ApiHideProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BaseAppEntity } from '../../utils/baseEntity';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart extends BaseAppEntity {
  @Column({ default: true })
  isActive!: boolean;

  @OneToOne(() => User, (user) => user.cart, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @ApiHideProperty()
  user!: User;

  @OneToMany(() => CartItem, (item) => item.cart, {
    cascade: true,
  })
  @ApiHideProperty()
  items!: CartItem[];
}
