import { Module } from '@nestjs/common';
import { TripsService } from './trips.service.js';
import { TripsController } from './trips.controller.js';
import { TripGeneratorService } from './trip-generator.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity.js';
import { Schedule } from '../schedules/entities/schedule.entity.js';
import { BookingSeat } from '../booking_seats/entities/booking_seat.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Trip, Schedule, BookingSeat])],
  controllers: [TripsController],
  providers: [TripsService, TripGeneratorService],
  exports: [TripsService, TripGeneratorService],
})
export class TripsModule {}
