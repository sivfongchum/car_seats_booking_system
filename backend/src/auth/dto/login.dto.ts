import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {

  @IsString()
  @IsOptional()
  identifier?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;
}
