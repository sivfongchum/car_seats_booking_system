import { IsNotEmpty, IsString, IsNumber, IsBoolean, isNotEmpty } from 'class-validator';

export class CreateRouteDto {

    @IsNotEmpty()
    origin: string;

    @IsNotEmpty()
    destination: string;

    @IsNumber()
    @IsNotEmpty()
    estimatedDurationMinutes: number;

    @IsNumber()
    @IsNotEmpty()
    distance: number;

    @IsNumber() 
    @IsNotEmpty()
    basePrice: number;

    @IsString()
    @IsNotEmpty()
    currency: string;

    @IsBoolean()
    isActive: boolean;
 
}
