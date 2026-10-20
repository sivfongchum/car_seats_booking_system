import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingSeatDto } from './create-booking_seat.dto.js';

export class UpdateBookingSeatDto extends PartialType(CreateBookingSeatDto) {}
