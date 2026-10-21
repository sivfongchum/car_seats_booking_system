import { 
    IsNotEmpty, 
    IsUUID, 
    IsEnum, 
    IsOptional, 
    IsDateString, 
    IsNumber, 
    Min, 
    IsString 
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { TripStatusEnums } from '../enums/trip_status_enums.js';
  
  export class CreateTripDto {
    @IsUUID('4')
    @IsNotEmpty()
    routeId: string;
  
    @IsUUID('4')
    @IsNotEmpty()
    vehicleId: string;
  
    @IsUUID('4')
    @IsNotEmpty()
    driverId: string;
  
    @IsDateString()
    @IsNotEmpty()
    departureDate: string;
  
    @IsDateString()
    @IsNotEmpty()
    arriveAt: string;
  
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    pricePerSeat: number;
  
    @IsString()
    @IsNotEmpty()
    currency: string;
  
    @IsEnum(TripStatusEnums)
    @IsOptional()
    status?: TripStatusEnums;
  }