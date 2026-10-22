import { 
  BadRequestException, 
  ConflictException, 
  Injectable, 
  NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { Booking } from './entities/booking.entity.js';
import { BookingSeat } from '../booking_seats/entities/booking_seat.entity.js';
import { Trip } from '../trips/entities/trip.entity.js';
import { Seat } from '../seats/entities/seat.entity.js';
import { BookingStatus } from './enums/booking-status.enum.js';
import { SeatBookingEnums } from '../booking_seats/enums/seat_booking_enums.js';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingSeat)
    private readonly bookingSeatRepository: Repository<BookingSeat>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
    private readonly dataSource: DataSource,
  ) {}

  // 1. បង្កើតការកក់ និង Lock កៅអី ១០ នាទី (HELD)
  async create(userId: string, createBookingDto: CreateBookingDto) {
    const { tripId, seatIds } = createBookingDto;

    // 1.1 ពិនិត្យមើលព័ត៌មានជើងធ្វើដំណើរ (Trip)
    const trip = await this.tripRepository.findOne({
      where: { id: tripId },
      relations: {
        route: true,
        vehicle: true,
      },
    });

    if (!trip) {
      throw new NotFoundException(`រកមិនឃើញជើងធ្វើដំណើរ (Trip ID: ${tripId})`);
    }

    if (new Date(trip.departureDate) <= new Date()) {
      throw new BadRequestException('ជើងធ្វើដំណើរនេះបានចេញដំណើរផុតទៅហើយ មិនអាចកក់បានទេ');
    }

    // 1.2 ពិនិត្យមើលកៅអីដែលបានជ្រើសរើស
    const seats = await this.seatRepository.find({
      where: { id: In(seatIds) },
    });

    if (seats.length !== seatIds.length) {
      throw new BadRequestException('កៅអីមួយចំនួនដែលបានជ្រើសរើសមិនត្រឹមត្រូវទេ');
    }

    for (const seat of seats) {
      if (seat.vehicleId !== trip.vehicleId) {
        throw new BadRequestException(
          `កៅអីលេខ ${seat.seatNumber} មិនស្ថិតក្នុងរថយន្តនៃជើងធ្វើដំណើរនេះទេ`,
        );
      }
    }

    // 1.3 ពិនិត្យមើល Concurrency / Conflict (ការពារការកក់ជាន់គ្នា)
    const now = new Date();
    const existingActiveSeats = await this.bookingSeatRepository
      .createQueryBuilder('bs')
      .innerJoinAndSelect('bs.booking', 'b')
      .innerJoinAndSelect('bs.seat', 's')
      .where('b.tripId = :tripId', { tripId })
      .andWhere('bs.seatId IN (:...seatIds)', { seatIds })
      .andWhere(
        '(bs.status = :bookedStatus OR (bs.status = :heldStatus AND b.expiresAt > :now))',
        {
          bookedStatus: SeatBookingEnums.BOOKED,
          heldStatus: SeatBookingEnums.HELD,
          now,
        },
      )
      .getMany();

    if (existingActiveSeats.length > 0) {
      const busyNumbers = existingActiveSeats.map((bs) => bs.seat?.seatNumber).join(', ');
      throw new ConflictException(
        `កៅអីលេខ [${busyNumbers}] ត្រូវបានគេកក់រួចហើយ ឬកំពុងរង់ចាំការបង់ប្រាក់!`,
      );
    }

    // 1.4 ចាប់ផ្តើម Database Transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bookingNumber = `BK-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const totalAmount = Number(trip.pricePerSeat) * seats.length;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Lock 10 នាទី

      // រក្សាទុក Booking Header
      const booking = queryRunner.manager.create(Booking, {
        bookingNumber,
        userId,
        tripId: trip.id,
        totalAmount,
        currency: trip.currency || 'USD',
        status: BookingStatus.PENDING,
        expiresAt,
      });
      const savedBooking = await queryRunner.manager.save(Booking, booking);

      // រក្សាទុក BookingSeats (Status: HELD)
      const bookingSeats = seats.map((seat) =>
        queryRunner.manager.create(BookingSeat, {
          bookingId: savedBooking.id,
          seatId: seat.id,
          price: trip.pricePerSeat,
          status: SeatBookingEnums.HELD,
        }),
      );
      await queryRunner.manager.save(BookingSeat, bookingSeats);

      await queryRunner.commitTransaction();

      return {
        message: 'ការកក់កៅអីបណ្តោះអាសន្នជោគជ័យ សូមបង់ប្រាក់ក្នុងរង្វង់ ១០ នាទី',
        booking: {
          id: savedBooking.id,
          bookingNumber: savedBooking.bookingNumber,
          userId: savedBooking.userId,
          tripId: savedBooking.tripId,
          totalAmount: savedBooking.totalAmount,
          currency: savedBooking.currency,
          status: savedBooking.status,
          expiresAt: savedBooking.expiresAt,
          createdAt: savedBooking.createdAt,
          bookingSeats: bookingSeats.map((bs, index) => ({
            id: bs.id,
            bookingId: bs.bookingId,
            seatId: bs.seatId,
            price: bs.price,
            status: bs.status,
            seatNumber: seats[index].seatNumber,
            seatType: seats[index].seatType,
          })),
          trip: {
            origin: trip.route?.origin,
            destination: trip.route?.destination,
            departureDate: trip.departureDate,
          },
        },
        expiresInSeconds: 600,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 2. ទាញយកបញ្ជីការកក់ទាំងអស់
  async findAll(userId?: string) {
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.bookingSeats', 'bookingSeats')
      .leftJoinAndSelect('bookingSeats.seat', 'seat')
      .leftJoinAndSelect('booking.payments', 'payments')
      .orderBy('booking.createdAt', 'DESC');

    if (userId) {
      query.where('booking.userId = :userId', { userId });
    }

    return await query.getMany();
  }

  // 3. ទាញយកព័ត៌មានការកក់មួយជាក់លាក់
  async findOne(id: string, userId?: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: {
        bookingSeats: {
          seat: true,
        },
        payments: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`រកមិនឃើញការកក់ ID: ${id}`);
    }

    if (userId && booking.userId !== userId) {
      throw new BadRequestException('អ្នកមិនមានសិទ្ធិមើលការកក់របស់អ្នកដទៃឡើយ');
    }

    return booking;
  }

  // 4. លុបចោលការកក់ (Cancel Booking)
  async cancel(id: string, userId: string) {
    const booking = await this.findOne(id, userId);

    if (booking.status === BookingStatus.CONFIRMED) {
      throw new BadRequestException('ការកក់ដែលបានបង់លុយរួចហើយ មិនអាចលុបចោលដោយផ្ទាល់បានទេ');
    }

    if (booking.status === BookingStatus.EXPIRED || booking.status === BookingStatus.CANCELLED) {
      return { message: 'ការកក់នេះបានបញ្ចប់រួចរាល់ហើយ' };
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      booking.status = BookingStatus.CANCELLED;
      await queryRunner.manager.save(Booking, booking);

      await queryRunner.manager
        .createQueryBuilder()
        .update(BookingSeat)
        .set({ status: SeatBookingEnums.CANCELLED })
        .where('bookingId = :id', { id: booking.id })
        .execute();

      await queryRunner.commitTransaction();
      return { message: 'ការកក់ត្រូវបានលុបចោលដោយជោគជ័យ' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    const booking = await this.findOne(id);
    Object.assign(booking, updateBookingDto);
    return await this.bookingRepository.save(booking);
  }

  async remove(id: string) {
    const booking = await this.findOne(id);
    await this.bookingRepository.remove(booking);
    return { message: `ការកក់ ID "${id}" ត្រូវបានលុបចេញពីប្រព័ន្ធ` };
  }
}
