import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity.js';
import { CreateScheduleDto } from './dto/create-schedule.dto.js';
import { UpdateScheduleDto } from './dto/update-schedule.dto.js';
import { TripGeneratorService } from '../trips/trip-generator.service.js';
@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly tripGeneratorService: TripGeneratorService,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const schedule = this.scheduleRepository.create({
      ...createScheduleDto,
      daysOfWeek: createScheduleDto.daysOfWeek ?? [1, 2, 3, 4, 5, 6, 7],
      currency: createScheduleDto.currency ?? 'USD',
      isActive: createScheduleDto.isActive ?? true,
    });

    const saveShedule = await this.scheduleRepository.save(schedule);

    await this.tripGeneratorService.generateTripsForDaysAhead(30);

    return saveShedule;
  }

  async findAll(routeId?: string): Promise<Schedule[]> {
    const query = this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.route', 'route')
      .leftJoinAndSelect('schedule.vehicle', 'vehicle')
      .leftJoinAndSelect('schedule.driver', 'driver')
      .orderBy('schedule.departureTime', 'ASC');

    if (routeId) {
      query.where('schedule.routeId = :routeId', { routeId });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: {route : true, vehicle : true, driver : true},
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID "${id}" not found`);
    }

    return schedule;
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<Schedule> {
    const schedule = await this.findOne(id);
    const updated = Object.assign(schedule, updateScheduleDto);
    return await this.scheduleRepository.save(updated);
  }

  async remove(id: string): Promise<{ message: string }> {
    const schedule = await this.findOne(id);
    await this.scheduleRepository.remove(schedule);
    return { message: `Schedule with ID "${id}" has been deleted successfully` };
  }
}