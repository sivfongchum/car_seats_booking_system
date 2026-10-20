import { IsNotEmpty, IsString, IsNumber, IsEnum } from 'class-validator';
import { VehicleStatusEnums } from '../enums/vehicle_status_enums.js';

export class CreateVehicleDto {
    @IsNotEmpty()
    @IsString()
    plateNumber: string;

    @IsNotEmpty()
    @IsString()
    vehicleType: string;

    @IsNotEmpty()
    @IsString()
    model: string;

    @IsNotEmpty()
    @IsNumber()
    year: number;

    @IsNotEmpty()
    @IsNumber()
    capacity: number;

}
