import { Injectable } from '@nestjs/common';
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
      const seat = (manager ? manager.create(Seat) : this.seatRepository.create());
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

  create(createSeatDto: CreateSeatDto) {
    return 'This action adds a new seat';
  }

  findAll() {
    return `This action returns all seats`;
  }

  findOne(id: number) {
    return `This action returns a #${id} seat`;
  }

  update(id: number, updateSeatDto: UpdateSeatDto) {
    return `This action updates a #${id} seat`;
  }

  remove(id: number) {
    return `This action removes a #${id} seat`;
  }
}
