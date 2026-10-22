import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { BookingSeatsService } from './booking_seats.service.js';
import { CreateBookingSeatDto } from './dto/create-booking_seat.dto.js';
import { UpdateBookingSeatDto } from './dto/update-booking_seat.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/enums/role.enum.js';

@Controller('booking-seats')
export class BookingSeatsController {
  constructor(private readonly bookingSeatsService: BookingSeatsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createBookingSeatDto: CreateBookingSeatDto) {
    return this.bookingSeatsService.create(createBookingSeatDto);
  }

  @Get()
  findAll(@Query('bookingId') bookingId?: string) {
    return this.bookingSeatsService.findAll(bookingId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingSeatsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingSeatDto: UpdateBookingSeatDto) {
    return this.bookingSeatsService.update(id, updateBookingSeatDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingSeatsService.remove(id);
  }
}
