import { IsNotEmpty, IsString, IsNumber, IsBoolean, isNotEmpty } from 'class-validator';

export class CreateDriverDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    phoneNumber: string;

 

}
