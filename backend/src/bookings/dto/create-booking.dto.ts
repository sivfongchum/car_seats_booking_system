import { IsArray, IsNotEmpty, IsUUID, ArrayNotEmpty } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsUUID()
  tripId: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  seatIds: string[];
}
