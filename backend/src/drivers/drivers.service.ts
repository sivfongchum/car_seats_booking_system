import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDriverDto } from './dto/create-driver.dto.js';
import { UpdateDriverDto } from './dto/update-driver.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity.js';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
  ) {}

  // create drivers
  async createDriver(createDriverDto: CreateDriverDto): Promise<Driver> {
    const driver = this.driverRepository.create(createDriverDto);
    return await this.driverRepository.save(driver);
  }

  create(createDriverDto: CreateDriverDto): Promise<Driver> {
    return this.createDriver(createDriverDto);
  }

  async findAll(): Promise<Driver[]> {
    return this.driverRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id },
    });

    if (!driver) {
      throw new NotFoundException(`រកមិនឃើញតៃកុងឡាន ID: ${id}`);
    }

    return driver;
  }

  async update(id: string, updateDriverDto: UpdateDriverDto): Promise<Driver> {
    const driver = await this.findOne(id);
    Object.assign(driver, updateDriverDto);
    return await this.driverRepository.save(driver);
  }

  async remove(id: string): Promise<{ message: string }> {
    const driver = await this.findOne(id);
    await this.driverRepository.remove(driver);
    return { message: `តៃកុងឡាន ID "${id}" ត្រូវបានលុបចេញពីប្រព័ន្ធ` };
  }
}
