import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  async findMyCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    return this.calculateCartTotals(cart);
  }

  async addItem(userId: string, createCartDto: CreateCartDto) {
    const cart = await this.getOrCreateCart(userId);
    const product = await this.productsService.findOne(createCartDto.productId);

    const existingItem = cart.items.find((item) => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity += createCartDto.quantity;
      existingItem.unitPrice = Number(product.price);
      await this.cartItemsRepository.save(existingItem);
    } else {
      const cartItem = this.cartItemsRepository.create({
        cart,
        product,
        quantity: createCartDto.quantity,
        unitPrice: Number(product.price),
      });
      cart.items.push(await this.cartItemsRepository.save(cartItem));
    }

    return this.findMyCart(userId);
  }

  async updateItem(userId: string, itemId: string, updateCartDto: UpdateCartDto) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((cartItem) => cartItem.id === itemId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    item.quantity = updateCartDto.quantity;
    await this.cartItemsRepository.save(item);

    return this.findMyCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((cartItem) => cartItem.id === itemId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemsRepository.delete(item.id);
    return this.findMyCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    if (cart.items.length) {
      await this.cartItemsRepository.delete(cart.items.map((item) => item.id));
    }

    return this.findMyCart(userId);
  }

  async getOrCreateCart(userId: string) {
    const user = await this.usersService.findOne(userId);
    let cart = await this.cartsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartsRepository.create({
        user,
        items: [],
      });
      cart = await this.cartsRepository.save(cart);
      cart.items = [];
    }

    return cart;
  }

  calculateCartTotals(cart: Cart) {
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.unitPrice) * item.quantity;
    }, 0);

    return {
      ...cart,
      subtotal,
      totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }
}
