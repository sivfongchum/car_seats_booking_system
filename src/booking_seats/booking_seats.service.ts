import { Injectable } from '@nestjs/common';
import { CreateBookingSeatDto } from './dto/create-booking_seat.dto.js';
import { UpdateBookingSeatDto } from './dto/update-booking_seat.dto.js';

@Injectable()
export class BookingSeatsService {
  create(createBookingSeatDto: CreateBookingSeatDto) {
    return 'This action adds a new bookingSeat';
  }

  findAll() {
    return `This action returns all bookingSeats`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bookingSeat`;
  }

  update(id: number, updateBookingSeatDto: UpdateBookingSeatDto) {
    return `This action updates a #${id} bookingSeat`;
  }

  remove(id: number) {
    return `This action removes a #${id} bookingSeat`;
  }
}
