import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    UsersModule,
    ProductsModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService, TypeOrmModule],
})
export class CartModule {}
