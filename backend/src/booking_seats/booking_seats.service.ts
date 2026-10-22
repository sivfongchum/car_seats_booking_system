import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookingSeatDto } from './dto/create-booking_seat.dto.js';
import { UpdateBookingSeatDto } from './dto/update-booking_seat.dto.js';
import { BookingSeat } from './entities/booking_seat.entity.js';

@Injectable()
export class BookingSeatsService {
  constructor(
    @InjectRepository(BookingSeat)
    private readonly bookingSeatRepository: Repository<BookingSeat>,
  ) {}

  async create(createBookingSeatDto: CreateBookingSeatDto): Promise<BookingSeat> {
    const bookingSeat = this.bookingSeatRepository.create(createBookingSeatDto);
    return await this.bookingSeatRepository.save(bookingSeat);
  }

  async findAll(bookingId?: string): Promise<BookingSeat[]> {
    const where = bookingId ? { bookingId } : {};
    return this.bookingSeatRepository.find({
      where,
      relations: {
        seat: true,
      },
    });
  }

  async findOne(id: string): Promise<BookingSeat> {
    const bookingSeat = await this.bookingSeatRepository.findOne({
      where: { id },
      relations: {
        seat: true,
        booking: true,
      },
    });

    if (!bookingSeat) {
      throw new NotFoundException(`រកមិនឃើញ BookingSeat ID: ${id}`);
    }

    return bookingSeat;
  }

  async update(id: string, updateBookingSeatDto: UpdateBookingSeatDto): Promise<BookingSeat> {
    const bookingSeat = await this.findOne(id);
    Object.assign(bookingSeat, updateBookingSeatDto);
    return await this.bookingSeatRepository.save(bookingSeat);
  }

  async remove(id: string): Promise<{ message: string }> {
    const bookingSeat = await this.findOne(id);
    await this.bookingSeatRepository.remove(bookingSeat);
    return { message: `BookingSeat ID "${id}" ត្រូវបានលុបចេញពីប្រព័ន្ធ` };
  }
}
