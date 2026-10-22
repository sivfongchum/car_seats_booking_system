import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulesService } from './schedules.service.js';
import { SchedulesController } from './schedules.controller.js';
import { Schedule } from './entities/schedule.entity.js';
import { TripGeneratorService } from '../trips/trip-generator.service.js';
import { Trip } from '../trips/entities/trip.entity.js';
@Module({
  imports: [TypeOrmModule.forFeature([Schedule, Trip])],
  controllers: [SchedulesController],
  providers: [SchedulesService, TripGeneratorService],
  exports: [SchedulesService, TypeOrmModule], // Export so TripsModule can access ScheduleRepository
})
export class SchedulesModule {}