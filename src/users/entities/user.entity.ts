import { Exclude } from 'class-transformer';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseAppEntity } from '../../utils/baseEntity';
import { UserRole } from '../../common/enums/user-role.enum';
import { Order } from '../../orders/entities/order.entity';
import { Cart } from '../../cart/entities/cart.entity';

@Entity('users')
export class User extends BaseAppEntity {
  @ApiProperty({ example: 'John' })
  @Column()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @Column()
  lastName!: string;

  @ApiProperty({ example: 'john@example.com' })
  @Column({ unique: true })
  email!: string;

  @Exclude()
  @Column({ select: false })
  password!: string;

  @ApiProperty({ example: '+201000000000', required: false })
  @Column({ type: 'varchar', nullable: true })
  phone?: string | null;

  @ApiProperty({ example: 'Cairo, Egypt', required: false })
  @Column({ type: 'varchar', nullable: true })
  address?: string | null;

  @ApiProperty({ enum: UserRole, enumName: 'UserRole' })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role!: UserRole;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => Order, (order) => order.user)
  @ApiHideProperty()
  orders!: Order[];

  @OneToOne(() => Cart, (cart) => cart.user)
  @ApiHideProperty()
  cart!: Cart;
}
