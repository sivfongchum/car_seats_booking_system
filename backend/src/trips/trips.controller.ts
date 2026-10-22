import { Controller, Get, Query, Param, Delete, Patch, Body, UseGuards } from '@nestjs/common';
import { TripsService } from './trips.service.js';
import { UpdateTripDto } from './dto/update-trip.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/enums/role.enum.js';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  // GET /trips?origin=Siem Reap&destination=Phnom Penh&date=2026-10-25
  @Get()
  getTripsByRoutes(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    return this.tripsService.getTripsByRoutes(origin, destination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @Get(':id/seats')
  getTripSeats(@Param('id') id: string) {
    return this.tripsService.getTripSeatMap(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tripsService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTripDto: UpdateTripDto,
  ) {
    return this.tripsService.update(id, updateTripDto);
  }
}