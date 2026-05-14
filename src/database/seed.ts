import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import configuration from '../config/env.configuration';
import { validateEnv } from '../config/env.validation';
import { typeOrmOptionsFactory } from './typeorm.config';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Repository } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.env',
      load: [configuration],
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmOptionsFactory,
    }),
    TypeOrmModule.forFeature([
      User,
      Order,
      OrderItem,
      Cart,
      CartItem,
      Category,
      Product,
      Payment,
    ]),
  ],
})
class SeedModule {}

async function seed() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const usersRepository = app.get<Repository<User>>(getRepositoryToken(User));

  console.log('Connected to database.');

  const existingAdmin = await usersRepository.findOne({
    where: { email: 'admin@gmail.com' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists — skipping.');
  } else {
    const hashedPassword = await bcrypt.hash('admin', 10);
    const admin = usersRepository.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    });
    await usersRepository.save(admin);
    console.log('Admin user created successfully!');
    console.log('  Email:    admin@gmail.com');
    console.log('  Password: admin');
    console.log('  Role:     ADMIN');
  }

  await app.close();
  console.log('Done.');
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
