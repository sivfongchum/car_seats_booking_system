import { 
    IsNotEmpty, 
    IsUUID, 
    IsEnum, 
    IsOptional, 
    IsNumber, 
    Min 
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { SeatBookingEnums } from '../enums/seat_booking_enums.js';
  
  export class CreateBookingSeatDto {
    @IsUUID('4')
    @IsNotEmpty()
    bookingId: string;
  
    @IsUUID('4')
    @IsNotEmpty()
    seatId: string;
  
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    price: number;
  
    @IsEnum(SeatBookingEnums)
    @IsOptional()
    status?: SeatBookingEnums;
  }