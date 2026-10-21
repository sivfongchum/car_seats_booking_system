import { 
    IsNotEmpty, 
    IsUUID, 
    IsOptional, 
    IsString, 
    IsInt, 
    Min, 
    Max, 
    IsArray, 
    ArrayMinSize, 
    IsNumber, 
    Matches, 
    IsBoolean 
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export class CreateScheduleDto {
    @IsUUID('4')
    @IsNotEmpty()
    routeId: string;
  
    @IsUUID('4')
    @IsOptional()
    vehicleId?: string;
  
    @IsUUID('4')
    @IsOptional()
    driverId?: string;
  
    // Format HH:MM or HH:MM:SS (e.g. "06:30", "08:30:00")
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
      message: 'departureTime must be a valid time string in format HH:mm or HH:mm:ss',
    })
    @IsNotEmpty()
    departureTime: string;
  
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    estimatedDurationMinutes: number;
  
    // 1 = Monday, 7 = Sunday
    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    @Min(1, { each: true })
    @Max(7, { each: true })
    @IsOptional()
    daysOfWeek?: number[];
  
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    price: number;
  
    @IsString()
    @IsOptional()
    currency?: string;
  
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
  }