import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity.js';
import { SeatsService } from '../seats/seats.service.js';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    private readonly seatsService: SeatsService,
    private readonly dataSource: DataSource,
  ) { }

  // create vehicles
  async createVehicle(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const existingVehicle = await this.vehicleRepository.findOne({
      where: { plateNumber: createVehicleDto.plateNumber },
    });

    if (existingVehicle) {
      throw new ConflictException(
        `Vehicle with plate number ${createVehicleDto.plateNumber} already exists!`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // create vehicle
      const vehicle = queryRunner.manager.create(Vehicle, createVehicleDto);
      const savedVehicle = await queryRunner.manager.save(Vehicle, vehicle);

      // create seats
      const seats = await this.seatsService.createSeatsForVehicle(
        savedVehicle.id,
        savedVehicle.capacity,
        queryRunner.manager,
      );

      // commit transaction
      await queryRunner.commitTransaction();

      savedVehicle.seats = seats;
      return savedVehicle;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof ConflictException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to create vehicle and seats';
      throw new InternalServerErrorException(message);
    } finally {
      await queryRunner.release();
    }
  }


  async findAll(): Promise<any> {
    const vehicles = await this.vehicleRepository.find({ relations: { seats: true } });

    const formattedVehicles = vehicles.map(vehicle => {
      return {
        id: vehicle.id,
        plateNumber: vehicle.plateNumber,
        vehicleType: vehicle.vehicleType,
        model: vehicle.model,
        year: vehicle.year,
        capacity: vehicle.capacity,
        status: vehicle.status,
        seats: vehicle.seats.map(seat => {
          return {
            id: seat.id,
            seatNumber: seat.seatNumber,
            seatType: seat.seatType,
            status: seat.status,
          };
        }),
      };
    });
    return formattedVehicles;
  }

  async findOne(id: string): Promise<any> {
    const vehicle = await this.vehicleRepository.findOne({ where: { id }, relations: { seats: true } });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id ${id} not found`);
    }
    return vehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    return `This action updates a #${id} vehicle`;
  }

  async removeVehicle(id: string) : Promise<{message : string}> {
    const vehicle = await this.vehicleRepository.findOne({ where: { id :id } , relations: { seats: true } });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id ${id} not found`);
    }
    await this.vehicleRepository.delete(id);

    return {message : 'Vehicle removed'};
  }
}
