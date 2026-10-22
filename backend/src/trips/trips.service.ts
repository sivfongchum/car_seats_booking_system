import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateTripDto } from './dto/update-trip.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './entities/trip.entity.js';
import { BookingSeat } from '../booking_seats/entities/booking_seat.entity.js';
import { SeatBookingEnums } from '../booking_seats/enums/seat_booking_enums.js';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @InjectRepository(BookingSeat)
    private readonly bookingSeatRepository: Repository<BookingSeat>,
  ) {}

  async getTripSeatMap(tripId: string) {
    const trip = await this.tripRepository.findOne({
      where: { id: tripId },
      relations: {
        vehicle: {
          seats: true,
        },
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID "${tripId}" not found`);
    }

    const activeBookingSeats = await this.bookingSeatRepository
      .createQueryBuilder('bs')
      .innerJoin('bs.booking', 'b')
      .where('b.tripId = :tripId', { tripId })
      .andWhere('bs.status IN (:...statuses)', {
        statuses: [SeatBookingEnums.HELD, SeatBookingEnums.BOOKED],
      })
      .getMany();

    const bookingSeatMap = new Map<string, SeatBookingEnums>();
    for (const bs of activeBookingSeats) {
      bookingSeatMap.set(bs.seatId, bs.status);
    }

    const seats = (trip.vehicle?.seats || [])
      .sort((a, b) => a.seatNumber - b.seatNumber)
      .map((seat) => {
        const activeStatus = bookingSeatMap.get(seat.id);
        let displayStatus = 'AVAILABLE';
        if (activeStatus === SeatBookingEnums.BOOKED) {
          displayStatus = 'BOOKED';
        } else if (activeStatus === SeatBookingEnums.HELD) {
          displayStatus = 'WAITING_PAYMENT';
        }

        return {
          id: seat.id,
          seatNumber: seat.seatNumber,
          seatType: seat.seatType,
          status: displayStatus,
        };
      });

    return {
      tripId: trip.id,
      vehicleId: trip.vehicleId,
      totalSeats: seats.length,
      seats,
    };
  }

 

  async getTripsByRoutes(origin?: string, destination?: string): Promise<Trip[]> {
    const where: any = {};
    if (origin && destination) {
      where.route = { origin, destination };
    } else if (origin) {
      where.route = { origin };
    } else if (destination) {
      where.route = { destination };
    }

    return await this.tripRepository.find({
      where: Object.keys(where).length > 0 ? where : {},
      relations: {
        route: true,
        vehicle: true,
        driver: true,
      },
      order: {
        departureDate: 'ASC',
      },
    });
  }

  async findOne(id: string) : Promise<Trip> {
    const isMatch = await this.tripRepository.findOne({
      where: { id },
      relations: {
        route: true,
        vehicle: true,
        driver: true,
      },
    });

    if (!isMatch) {
      throw new NotFoundException(`Trip with ID "${id}" not found`);
    }

    return isMatch;
  }

  async update(id: string, updateTripDto: UpdateTripDto): Promise<Trip> {
    // 1. Find existing trip by ID
    const trip = await this.tripRepository.findOne({
      where: { id },
      relations: {
        route: true,
        vehicle: true,
        driver: true,
      },
    });

    // 2. Throw 404 if trip not found
    if (!trip) {
      throw new NotFoundException(`Trip with ID "${id}" not found`);
    }

    // 3. Merge updated fields into existing trip entity
    Object.assign(trip, updateTripDto);

    // 4. Save and return updated entity
    return await this.tripRepository.save(trip);
  }


  async remove(id: string) : Promise<{message : string}> {
     await this.tripRepository.delete(id);

     return {message : 'Trip removed'};
  }
}
