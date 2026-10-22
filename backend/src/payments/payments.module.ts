import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { PaymentsController } from './payments.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity.js';
import { Booking } from '../bookings/entities/booking.entity.js';
import { BookingSeat } from '../booking_seats/entities/booking_seat.entity.js';
import { AbaPaywayService } from './aba-payway.service.js';
import { TelegramService } from './telegram.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Booking, BookingSeat])],
  controllers: [PaymentsController],
  providers: [PaymentsService, AbaPaywayService, TelegramService],
  exports: [PaymentsService, AbaPaywayService, TelegramService, TypeOrmModule],
})
export class PaymentsModule {}
