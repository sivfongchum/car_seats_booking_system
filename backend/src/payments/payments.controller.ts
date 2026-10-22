import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdatePaymentDto } from './dto/update-payment.dto.js';
import { PaymentMethodEnums } from './enums/payment_mathod_enums.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/enums/role.enum.js';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  // 1. Create payment data for scanning payment with ABA PayWay
  @Post('aba/checkout')
  createAbaCheckout(
    @Body() body: { bookingId: string; returnUrl?: string },
  ) {
    return this.paymentsService.createAbaCheckout(body.bookingId, body.returnUrl);
  }

  // 2. Webhook for receiving callback from ABA PayWay
  @Post('aba/webhook')
  @HttpCode(HttpStatus.OK)
  async handleAbaWebhook(
    @Body() body: { tran_id?: string; bookingId?: string; apv?: string; hash?: string; status?: number },
  ) {
    const reference = body.tran_id || body.bookingId;
    if (!reference) {
      return { status: 1, message: 'Missing tran_id or bookingId' };
    }
    const transactionRef = body.apv || `ABA-${Date.now()}`;
    await this.paymentsService.handlePaymentSuccess(
      reference,
      transactionRef,
      PaymentMethodEnums.ABA,
    );
    return { status: 0, message: 'Success' };
  }

  // 3. Frontend "Proceed" / "Confirm Payment" button endpoint
  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  async confirmPayment(
    @Body() body: { bookingId?: string; bookingNumber?: string; tran_id?: string },
  ) {
    const reference = body.bookingId || body.bookingNumber || body.tran_id;
    if (!reference) {
      throw new BadRequestException('bookingId, bookingNumber, or tran_id is required');
    }
    const payment = await this.paymentsService.handlePaymentSuccess(
      reference,
      `PROCEED-${Date.now()}`,
      PaymentMethodEnums.ABA,
    );
    return {
      status: 'success',
      message: 'Payment completed successfully. Booking is confirmed.',
      bookingId: payment.bookingId,
      paymentId: payment.id,
      amount: payment.amount,
      paymentStatus: payment.paymentStatus,
    };
  }

  // 4. Webhook (Fallback / Testing)
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(
    @Body() body: { bookingId: string; transactionReference: string },
  ) {
    return this.paymentsService.handlePaymentSuccess(
      body.bookingId,
      body.transactionReference,
      PaymentMethodEnums.ABA,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
