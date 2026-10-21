import { Injectable } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto.js';
import { UpdateTripDto } from './dto/update-trip.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './entities/trip.entity.js';


@Injectable()
export class TripsService {

  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    ){}

  create(createTripDto: CreateTripDto) {
    return 'This action adds a new trip';
  }

  async getTripsByRoutes(origin: string, destination: string): Promise<Trip[]> {
    return await this.tripRepository.find({
      where: {
        route: {
          origin: origin,
          destination: destination,
        },
      },
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

  findOne(id: number) {
    return `This action returns a #${id} trip`;
  }

  update(id: number, updateTripDto: UpdateTripDto) {
    return `This action updates a #${id} trip`;
  }

  remove(id: number) {
    return `This action removes a #${id} trip`;
  }
}
