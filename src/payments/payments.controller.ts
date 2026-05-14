import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { validateUUID } from '../utils/validateUUID';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout-session')
  createCheckoutSession(
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    return this.paymentsService.createCheckoutSession(createPaymentDto, user);
  }

  @Public()
  @Post('webhook')
  handleWebhook(
    @Req() request: any,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(request.rawBody, signature);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentsService.update(
      validateUUID(id, 'paymentId'),
      updatePaymentDto,
    );
  }
}
