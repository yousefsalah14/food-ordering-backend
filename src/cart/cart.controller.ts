import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { validateUUID } from '../utils/validateUUID';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  findMyCart(@CurrentUser() user: { sub: string }) {
    return this.cartService.findMyCart(user.sub);
  }

  @Post('items')
  addItem(
    @CurrentUser() user: { sub: string },
    @Body() createCartDto: CreateCartDto,
  ) {
    return this.cartService.addItem(user.sub, createCartDto);
  }

  @Patch('items/:itemId')
  updateItem(
    @CurrentUser() user: { sub: string },
    @Param('itemId') itemId: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this.cartService.updateItem(
      user.sub,
      validateUUID(itemId, 'cartItemId'),
      updateCartDto,
    );
  }

  @Delete('items/:itemId')
  removeItem(@CurrentUser() user: { sub: string }, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(user.sub, validateUUID(itemId, 'cartItemId'));
  }

  @Delete()
  clearCart(@CurrentUser() user: { sub: string }) {
    return this.cartService.clearCart(user.sub);
  }
}
