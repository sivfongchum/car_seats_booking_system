import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, LessThan } from 'typeorm';
import { Booking } from './entities/booking.entity.js';
import { BookingSeat } from '../booking_seats/entities/booking_seat.entity.js';
import { SeatBookingEnums } from '../booking_seats/enums/seat_booking_enums.js';
import { BookingStatus } from './enums/booking-status.enum.js';

@Injectable()
export class BookingExpirationService {
  private readonly logger = new Logger(BookingExpirationService.name);

  constructor(private readonly dataSource: DataSource) {}

  // Run automatically every 1 minute
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredBookings(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const now = new Date();

      // 1. Find all pending bookings where expires_at < now
      const expiredBookings = await queryRunner.manager.find(Booking, {
        where: {
          status: BookingStatus.PENDING,
          expiresAt: LessThan(now),
        },
        relations: {
          bookingSeats: true,
        },
      });

      if (expiredBookings.length === 0) {
        await queryRunner.rollbackTransaction();
        return;
      }

      const expiredBookingIds = expiredBookings.map((b) => b.id);

      // 2. Automatically update booking status to EXPIRED
      await queryRunner.manager
        .createQueryBuilder()
        .update(Booking)
        .set({ status: BookingStatus.EXPIRED })
        .where('id IN (:...ids)', { ids: expiredBookingIds })
        .execute();

      // 3. Automatically update all attached seats to EXPIRED (making seats free again)
      await queryRunner.manager
        .createQueryBuilder()
        .update(BookingSeat)
        .set({ status: SeatBookingEnums.EXPIRED })
        .where('bookingId IN (:...ids)', { ids: expiredBookingIds })
        .andWhere('status = :status', { status: SeatBookingEnums.HELD })
        .execute();

      await queryRunner.commitTransaction();
      this.logger.log(`Released seats for ${expiredBookings.length} expired bookings.`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to release expired bookings', error);
    } finally {
      await queryRunner.release();
    }
  }
}
