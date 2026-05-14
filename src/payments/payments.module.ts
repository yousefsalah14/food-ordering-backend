import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrdersModule } from '../orders/orders.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import Stripe from 'stripe';
import { STRIPE_API_VERSION, STRIPE_CLIENT } from './payments.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order]),
    forwardRef(() => OrdersModule),
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    {
      provide: STRIPE_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const stripeSecretKey = configService.get<string>('payments.stripeSecretKey');

        if (!stripeSecretKey) {
          return null;
        }

        return new Stripe(stripeSecretKey, {
          apiVersion: STRIPE_API_VERSION,
        });
      },
    },
  ],
  exports: [PaymentsService, TypeOrmModule],
})
export class PaymentsModule {}
