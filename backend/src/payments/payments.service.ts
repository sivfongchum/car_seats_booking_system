import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdatePaymentDto } from './dto/update-payment.dto.js';
import { Booking } from '../bookings/entities/booking.entity.js';
import { BookingSeat } from '../booking_seats/entities/booking_seat.entity.js';
import { Payment } from './entities/payment.entity.js';
import { Trip } from '../trips/entities/trip.entity.js';
import { SeatBookingEnums } from '../booking_seats/enums/seat_booking_enums.js';
import { BookingStatus } from '../bookings/enums/booking-status.enum.js';
import { PaymentStatus } from './enums/payment_satatus-enums.js';
import { PaymentMethodEnums } from './enums/payment_mathod_enums.js';
import { AbaPaywayService } from './aba-payway.service.js';
import { TelegramService } from './telegram.service.js';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly abaPaywayService: AbaPaywayService,
    private readonly telegramService: TelegramService,
    private readonly dataSource: DataSource,
  ) { }

  // 1. Create payment data for scanning payment with ABA PayWay
  async createAbaCheckout(bookingId: string, returnUrl?: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: {
        bookingSeats: {
          seat: true,
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`can't found booking ID: ${bookingId}`);
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      throw new BadRequestException('This booking has already been paid for');
    }

    if (booking.status === BookingStatus.EXPIRED || (booking.expiresAt && new Date(booking.expiresAt) < new Date())) {
      throw new BadRequestException('This booking has expired and cannot be paid for');
    }

    const items = (booking.bookingSeats || []).map((bs) => ({
      name: `Seat #${bs.seat?.seatNumber || 'Unknown'}`,
      quantity: 1,
      price: Number(bs.price || booking.totalAmount),
    }));

    // Create Payload for ABA PayWay (including QR Code Image)
    const abaCheckout = await this.abaPaywayService.createCheckoutPayload(
      booking.bookingNumber,
      booking.totalAmount,
      booking.currency || 'USD',
      items.length > 0 ? items : [{ name: 'Bus Ticket', quantity: 1, price: Number(booking.totalAmount) }],
      returnUrl,
    );

    return {
      message: 'create payment data for scanning payment with ABA PayWay successfully',
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      amount: booking.totalAmount,
      currency: booking.currency,
      expiresAt: booking.expiresAt,
      qrImage: abaCheckout.qrImage,
      qrString: abaCheckout.qrString,
      abaPayway: abaCheckout,
    };
  }

  //  handle payment successfully from ABA PayWay
  async handlePaymentSuccess(
    bookingIdOrNumber: string,
    transactionRef: string,
    paymentMethod: PaymentMethodEnums = PaymentMethodEnums.ABA,
  ): Promise<Payment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // find by id (if UUID) or bookingNumber
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(bookingIdOrNumber);
      const booking = await queryRunner.manager.findOne(Booking, {
        where: isUuid ? { id: bookingIdOrNumber } : { bookingNumber: bookingIdOrNumber },
        relations: {
          bookingSeats: {
            seat: true,
          },
          user: true,
        },
      });

      if (!booking) {
        throw new NotFoundException(`can't found booking for: ${bookingIdOrNumber}`);
      }

      let trip: Trip | null = null;
      if (booking.tripId) {
        trip = await queryRunner.manager.findOne(Trip, {
          where: { id: booking.tripId },
          relations: {
            route: true,
            vehicle: true,
          },
        });
      }

      if (booking.status === BookingStatus.CONFIRMED) {
        // If already confirmed, return old record
        const existingPayment = await this.paymentRepository.findOne({
          where: { bookingId: booking.id },
        });
        if (existingPayment) {
          await queryRunner.rollbackTransaction();
          return existingPayment;
        }
      }

      if (booking.status === BookingStatus.EXPIRED) {
        throw new BadRequestException('This booking has expired and cannot be paid for');
      }

      // record payment
      const payment = queryRunner.manager.create(Payment, {
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: booking.currency,
        paymentMethod: paymentMethod,
        transactionReference: transactionRef,
        paymentStatus: PaymentStatus.COMPLETED,
        paidAt: new Date(),
        paymentDate: new Date(),
      });
      const savedPayment = await queryRunner.manager.save(Payment, payment);

      // 2.2 change status booking to confirm
      booking.status = BookingStatus.CONFIRMED;
      await queryRunner.manager.save(Booking, booking);

      // 2.3 change status seat from held to booked
      await queryRunner.manager
        .createQueryBuilder()
        .update(BookingSeat)
        .set({ status: SeatBookingEnums.BOOKED })
        .where('bookingId = :bookingId', { bookingId: booking.id })
        .execute();

      await queryRunner.commitTransaction();

      // 2.4 Send Telegram Bot Notification in background
      try {
        const seatNumbers = booking.bookingSeats
          ?.map((bs) => (bs.seat?.seatNumber !== undefined ? String(bs.seat.seatNumber) : ''))
          .filter(Boolean);

        this.telegramService.sendPaymentSuccessNotification({
          bookingNumber: booking.bookingNumber,
          customerName: booking.user?.fullName || undefined,
          customerEmail: booking.user?.email || undefined,
          customerPhone: booking.user?.phone || undefined,
          origin: trip?.route?.origin,
          destination: trip?.route?.destination,
          departureDate: trip?.departureDate,
          vehiclePlate: trip?.vehicle?.plateNumber,
          seatNumbers: seatNumbers && seatNumbers.length > 0 ? seatNumbers : undefined,
          amount: booking.totalAmount,
          currency: booking.currency,
          paymentMethod: paymentMethod,
          transactionReference: transactionRef,
          paidAt: savedPayment.paidAt || new Date(),
        }).catch((err) => {
          this.logger.error('Failed to send Telegram notification', err);
        });
      } catch (notifyErr) {
        this.logger.error('Error formatting Telegram notification', notifyErr);
      }

      return savedPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 3. Get all payment transactions
  async findAll() {
    return this.paymentRepository.find({
      relations: {
        booking: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // 4. Get a specific payment transaction
  async findOne(id: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: {
        booking: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`can't found payment ID: ${id}`);
    }

    return payment;
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const payment = this.paymentRepository.create(createPaymentDto);
    return this.paymentRepository.save(payment);
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.findOne(id);
    Object.assign(payment, updatePaymentDto);
    return this.paymentRepository.save(payment);
  }

  async remove(id: string) {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
    return { message: `Payment ID "${id}" has been deleted` };
  }
}
