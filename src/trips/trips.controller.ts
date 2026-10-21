import { Controller, Get, Query } from '@nestjs/common';
import { TripsService } from './trips.service.js';

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
}