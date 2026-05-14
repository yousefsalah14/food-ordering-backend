import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { validateUUID } from '../utils/validateUUID';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @CurrentUser() user: { sub: string },
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(user.sub, createOrderDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: { sub: string; role: UserRole },
    @Query() query: QueryOrdersDto,
  ) {
    return this.ordersService.findAll(query, user);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: { sub: string; role: UserRole },
    @Param('id') id: string,
  ) {
    return this.ordersService.findOne(validateUUID(id, 'orderId'), user);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.updateStatus(
      validateUUID(id, 'orderId'),
      updateOrderDto,
    );
  }
}
