// src/trips/trip-generator.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Schedule } from '../schedules/entities/schedule.entity.js';
import { Trip } from './entities/trip.entity.js';
import { TripStatusEnums } from './enums/trip_status_enums.js';

@Injectable()
export class TripGeneratorService {
  private readonly logger = new Logger(TripGeneratorService.name);

  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
  ) {}

  // Run automatically every night at 00:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Generating trips for the upcoming 30 days...');
    await this.generateTripsForDaysAhead(30);
  }

  async generateTripsForDaysAhead(daysAhead: number): Promise<void> {
    const schedules = await this.scheduleRepository.find({ where: { isActive: true } });

    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayOffset);

      // JavaScript: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      // Normalized: 1 = Monday ... 7 = Sunday
      const jsDay = targetDate.getDay();
      const currentDayOfWeek = jsDay === 0 ? 7 : jsDay;

      for (const schedule of schedules) {
        if (!schedule.daysOfWeek.includes(currentDayOfWeek)) {
          continue;
        }

        const [hours, minutes] = schedule.departureTime.split(':').map(Number);
        
        const departureDate = new Date(targetDate);
        departureDate.setHours(hours, minutes, 0, 0);

        const arriveAt = new Date(departureDate.getTime() + schedule.estimatedDurationMinutes * 60000);

        // Check if trip already exists to avoid duplicates
        const existingTrip = await this.tripRepository.findOne({
          where: {
            routeId: schedule.routeId,
            vehicleId: schedule.vehicleId,
            departureDate: departureDate,
          },
        });

        if (!existingTrip) {
          const trip = this.tripRepository.create({
            routeId: schedule.routeId,
            vehicleId: schedule.vehicleId,
            driverId: schedule.driverId,
            departureDate: departureDate,
            arriveAt: arriveAt,
            pricePerSeat: schedule.price,
            currency: schedule.currency,
            status: TripStatusEnums.SCHEDULED,
          });

          await this.tripRepository.save(trip);
        }
      }
    }
    this.logger.log('Trip generation completed successfully.');
  }
}