import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { OrderStatus } from '../common/enums/order-status.enum';
import { PaymentMethod } from '../common/enums/payment-method.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { Order } from '../orders/entities/order.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
import { STRIPE_CLIENT } from './payments.constants';

type StripeClient = InstanceType<typeof Stripe>;

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly configService: ConfigService,
    @Inject(STRIPE_CLIENT)
    private readonly stripe: StripeClient | null,
  ) {}

  async createCheckoutSession(
    createPaymentDto: CreatePaymentDto,
    currentUser: { sub: string; role: UserRole },
  ) {
    this.ensureStripeIsConfigured();

    const order = await this.ordersRepository.findOne({
      where: { id: createPaymentDto.orderId },
      relations: ['user', 'items', 'items.product', 'payment'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (currentUser.role !== UserRole.ADMIN && order.user.id !== currentUser.sub) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentMethod !== PaymentMethod.CARD) {
      throw new BadRequestException(
        'This order is not configured for online card payment',
      );
    }

    if (!order.items.length) {
      throw new BadRequestException('Order has no items');
    }

    if (order.payment?.status === PaymentStatus.PAID) {
      throw new ConflictException('Order has already been paid');
    }

    const payment =
      order.payment ??
      this.paymentsRepository.create({
        order,
      });

    Object.assign(payment, {
      order,
      method: PaymentMethod.CARD,
      amount: Number(order.total),
      currency: this.configService.get<string>('payments.currency', 'usd'),
      status: PaymentStatus.PENDING,
    });

    const savedPayment = await this.paymentsRepository.save(payment);
    const successUrl =
      createPaymentDto.successUrl ??
      this.configService.get<string>('payments.stripeSuccessUrl');
    const cancelUrl =
      createPaymentDto.cancelUrl ??
      this.configService.get<string>('payments.stripeCancelUrl');
    const locale = createPaymentDto.locale?.toLowerCase().startsWith('ar')
      ? 'ar'
      : 'en';

    const session = await this.stripe!.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      client_reference_id: order.id,
      customer_email: order.user.email,
      metadata: {
        orderId: order.id,
        paymentId: savedPayment.id,
      },
      payment_intent_data: {
        metadata: {
          orderId: order.id,
          paymentId: savedPayment.id,
        },
      },
      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: payment.currency,
          unit_amount: Math.round(Number(item.unitPrice) * 100),
          product_data: {
            name: locale === 'ar' ? item.snapshotNameAr : item.snapshotNameEn,
            description:
              locale === 'ar'
                ? item.product.descriptionAr ?? undefined
                : item.product.descriptionEn ?? undefined,
            images: this.getStripeProductImages(item.product.imageUrl),
          },
        },
      })),
    });

    savedPayment.checkoutSessionId = session.id;
    savedPayment.transactionId = session.payment_intent
      ? String(session.payment_intent)
      : null;

    await this.paymentsRepository.save(savedPayment);

    return {
      paymentId: savedPayment.id,
      checkoutSessionId: session.id,
      checkoutUrl: session.url,
      status: savedPayment.status,
    };
  }

  async handleWebhook(payload: Buffer | string, signature: string) {
    this.ensureStripeIsConfigured();

    const webhookSecret = this.configService.get<string>(
      'payments.stripeWebhookSecret',
      '',
    );

    if (!signature || !webhookSecret) {
      throw new BadRequestException('Stripe webhook signature is missing');
    }

    const event = this.stripe!.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as any);
        break;
      case 'checkout.session.expired':
        await this.handleCheckoutExpired(event.data.object as any);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as any);
        break;
      default:
        break;
    }

    return { received: true };
  }

  async createManualPaymentRecord(order: Order) {
    const existingPayment = await this.paymentsRepository.findOne({
      where: { order: { id: order.id } },
      relations: ['order'],
    });

    if (existingPayment) {
      return existingPayment;
    }

    const payment = this.paymentsRepository.create({
      order,
      method: order.paymentMethod,
      amount: Number(order.total),
      currency: this.configService.get<string>('payments.currency', 'usd'),
      status: PaymentStatus.PENDING,
    });

    return this.paymentsRepository.save(payment);
  }

  async findAll() {
    return this.paymentsRepository.find({
      relations: ['order', 'order.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.paymentsRepository.findOne({ where: { id } });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    Object.assign(payment, updatePaymentDto);
    return this.paymentsRepository.save(payment);
  }

  private async handleCheckoutCompleted(session: any) {
    const payment = await this.findPaymentByMetadata(
      session.metadata?.paymentId,
      session.id,
    );

    if (!payment) {
      return;
    }

    payment.status = PaymentStatus.PAID;
    payment.checkoutSessionId = session.id;
    payment.transactionId = session.payment_intent
      ? String(session.payment_intent)
      : payment.transactionId;
    payment.paymentIntentId = session.payment_intent
      ? String(session.payment_intent)
      : payment.paymentIntentId;

    await this.paymentsRepository.save(payment);

    if (payment.order.status === OrderStatus.PENDING) {
      payment.order.status = OrderStatus.CONFIRMED;
      await this.ordersRepository.save(payment.order);
    }
  }

  private async handleCheckoutExpired(session: any) {
    const payment = await this.findPaymentByMetadata(
      session.metadata?.paymentId,
      session.id,
    );

    if (!payment) {
      return;
    }

    payment.status = PaymentStatus.FAILED;
    payment.checkoutSessionId = session.id;
    await this.paymentsRepository.save(payment);
  }

  private async handlePaymentFailed(paymentIntent: any) {
    const payment = await this.findPaymentByMetadata(
      paymentIntent.metadata?.paymentId,
      undefined,
      paymentIntent.id,
    );

    if (!payment) {
      return;
    }

    payment.status = PaymentStatus.FAILED;
    payment.paymentIntentId = paymentIntent.id;
    payment.transactionId = paymentIntent.id;
    await this.paymentsRepository.save(payment);
  }

  private async findPaymentByMetadata(
    paymentId?: string,
    checkoutSessionId?: string,
    paymentIntentId?: string,
  ) {
    if (paymentId) {
      return this.paymentsRepository.findOne({
        where: { id: paymentId },
        relations: ['order'],
      });
    }

    if (checkoutSessionId) {
      return this.paymentsRepository.findOne({
        where: { checkoutSessionId },
        relations: ['order'],
      });
    }

    if (paymentIntentId) {
      return this.paymentsRepository.findOne({
        where: [{ paymentIntentId }, { transactionId: paymentIntentId }],
        relations: ['order'],
      });
    }

    return null;
  }

  private ensureStripeIsConfigured() {
    if (!this.stripe) {
      throw new BadRequestException(
        'Stripe is not configured. Set STRIPE_SECRET_KEY first.',
      );
    }
  }

  private getStripeProductImages(imageUrl?: string | null) {
    if (!imageUrl) {
      return undefined;
    }

    if (/^https?:\/\//i.test(imageUrl)) {
      return [imageUrl];
    }

    const appBaseUrl = this.configService.get<string>(
      'app.baseUrl',
      'http://localhost:3000',
    );

    try {
      return [new URL(imageUrl, appBaseUrl).toString()];
    } catch {
      return undefined;
    }
  }
}
