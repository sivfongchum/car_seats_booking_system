import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateSeatDto } from './dto/create-seat.dto.js';
import { UpdateSeatDto } from './dto/update-seat.dto.js';
import { Seat } from './entities/seat.entity.js';
import { SeatTypeEnums } from './enums/seat_type_enums.js';
import { SeatStatusEnums } from './enums/seat_status_enums.js';

@Injectable()
export class SeatsService {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
  ) {}

  async createSeatsForVehicle(
    vehicleId: string,
    capacity: number,
    manager?: EntityManager,
  ): Promise<Seat[]> {
    const seats: Seat[] = [];

    for (let seatNum = 1; seatNum <= capacity; seatNum++) {
      const seat = manager ? manager.create(Seat) : this.seatRepository.create();
      seat.vehicleId = vehicleId;
      seat.seatNumber = seatNum;
      seat.seatType = seatNum <= 2 ? SeatTypeEnums.VIP : SeatTypeEnums.NORMAL;
      seat.status = SeatStatusEnums.AVAILABLE;
      seats.push(seat);
    }

    if (manager) {
      return manager.save(Seat, seats);
    }

    return this.seatRepository.save(seats);
  }

  async create(createSeatDto: CreateSeatDto): Promise<Seat> {
    const seat = this.seatRepository.create(createSeatDto);
    return await this.seatRepository.save(seat);
  }

  async findAll(vehicleId?: string): Promise<Seat[]> {
    const where = vehicleId ? { vehicleId } : {};
    return this.seatRepository.find({
      where,
      order: {
        seatNumber: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Seat> {
    const seat = await this.seatRepository.findOne({
      where: { id },
      relations: {
        vehicle: true,
      },
    });

    if (!seat) {
      throw new NotFoundException(`រកមិនឃើញកៅអី ID: ${id}`);
    }

    return seat;
  }

  async update(id: string, updateSeatDto: UpdateSeatDto): Promise<Seat> {
    const seat = await this.findOne(id);
    Object.assign(seat, updateSeatDto);
    return await this.seatRepository.save(seat);
  }

  async remove(id: string): Promise<{ message: string }> {
    const seat = await this.findOne(id);
    await this.seatRepository.remove(seat);
    return { message: `កៅអី ID "${id}" ត្រូវបានលុបចេញពីប្រព័ន្ធ` };
  }
}
