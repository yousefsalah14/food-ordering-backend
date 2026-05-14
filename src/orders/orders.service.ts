import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartService } from '../cart/cart.service';
import { PaymentMethod } from '../common/enums/payment-method.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { Payment } from '../payments/entities/payment.entity';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { getPaginationData } from '../utils/getPaginationData';
import { applySearch } from '../utils/search.util';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    private readonly cartService: CartService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const user = await this.usersService.findOne(userId);
    const cart = await this.cartService.getOrCreateCart(userId);

    if (!cart.items.length) {
      throw new BadRequestException('Cart is empty');
    }

    const subtotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.unitPrice) * item.quantity;
    }, 0);

    const order = this.ordersRepository.create({
      ...createOrderDto,
      subtotal,
      total: subtotal,
      user,
      items: cart.items.map((item) =>
        this.orderItemsRepository.create({
          product: item.product,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.unitPrice) * item.quantity,
          snapshotNameEn: item.product.nameEn,
          snapshotNameAr: item.product.nameAr,
        }),
      ),
    });

    const savedOrder = await this.ordersRepository.save(order);

    if (savedOrder.paymentMethod === PaymentMethod.CASH_ON_DELIVERY) {
      const payment = this.paymentsRepository.create({
        order: savedOrder,
        method: savedOrder.paymentMethod,
        amount: Number(savedOrder.total),
        currency: this.configService.get<string>('payments.currency', 'usd'),
      });
      await this.paymentsRepository.save(payment);
    }

    await this.cartService.clearCart(userId);
    return savedOrder;
  }

  async findAll(query: QueryOrdersDto, currentUser: { sub: string; role: UserRole }) {
    const { page, limit, search, status } = query;
    const queryBuilder = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product');

    if (currentUser.role !== UserRole.ADMIN) {
      queryBuilder.andWhere('user.id = :userId', { userId: currentUser.sub });
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    applySearch(queryBuilder, 'user', search, ['firstName', 'lastName', 'email']);
    queryBuilder.orderBy('order.createdAt', 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [items, totalItems] = await queryBuilder.getManyAndCount();

    return {
      items,
      meta: getPaginationData(totalItems, page, limit),
    };
  }

  async findOne(orderId: string, currentUser: { sub: string; role: UserRole }) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'items', 'items.product', 'payment'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (currentUser.role !== UserRole.ADMIN && order.user.id !== currentUser.sub) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(orderId: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = updateOrderDto.status;
    return this.ordersRepository.save(order);
  }
}
