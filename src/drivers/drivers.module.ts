import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service.js';
import { DriversController } from './drivers.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity.js';
@Module({
  imports: [TypeOrmModule.forFeature([Driver])],
  controllers: [DriversController],
  providers: [DriversService],
})
export class DriversModule {}
