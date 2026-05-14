import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from '../cart/cart.module';
import { Payment } from '../payments/entities/payment.entity';
import { UsersModule } from '../users/users.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Payment]),
    CartModule,
    UsersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}
