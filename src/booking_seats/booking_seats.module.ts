import { Module } from '@nestjs/common';
import { BookingSeatsService } from './booking_seats.service.js';
import { BookingSeatsController } from './booking_seats.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingSeat } from './entities/booking_seat.entity.js';
@Module({
  imports: [TypeOrmModule.forFeature([BookingSeat])],
  controllers: [BookingSeatsController],
  providers: [BookingSeatsService],
})
export class BookingSeatsModule {}
