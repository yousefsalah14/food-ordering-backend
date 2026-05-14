import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { OrderStatus } from '../common/enums/order-status.enum';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Product } from '../products/entities/product.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { generateCouponCode } from '../utils/generate-coupon.util';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    private readonly usersService: UsersService,
  ) {}

  async getDashboard() {
    const [users, products, categories, orders, payments, recentOrders] =
      await Promise.all([
        this.usersRepository.count(),
        this.productsRepository.count(),
        this.categoriesRepository.count(),
        this.ordersRepository.count(),
        this.paymentsRepository.count(),
        this.ordersRepository.find({
          relations: ['user', 'items'],
          order: { createdAt: 'DESC' },
          take: 5,
        }),
      ]);

    const pendingOrders = await this.ordersRepository.count({
      where: { status: OrderStatus.PENDING },
    });

    return {
      counts: {
        users,
        products,
        categories,
        orders,
        payments,
        pendingOrders,
      },
      recentOrders,
    };
  }

  generateCoupon(length?: number) {
    return {
      code: generateCouponCode(length),
    };
  }

  createUser(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
