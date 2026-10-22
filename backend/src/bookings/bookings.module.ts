import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { BookingsController } from './bookings.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity.js';
import { User } from '../users/entities/user.entity.js';
import { BookingSeat } from '../booking_seats/entities/booking_seat.entity.js';
import { Trip } from '../trips/entities/trip.entity.js';
import { Seat } from '../seats/entities/seat.entity.js';
import { BookingExpirationService } from './booking-expiration.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, User, BookingSeat, Trip, Seat]),
    AuthModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService, BookingExpirationService],
  exports: [BookingsService, BookingExpirationService],
})
export class BookingsModule {}
