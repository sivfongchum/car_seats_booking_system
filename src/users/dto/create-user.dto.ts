import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { UserRole } from '../enums/role.enum.js';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ValidateIf((o) => !o.phone || o.email)
  @IsEmail()
  @IsOptional()
  email?: string;

  @ValidateIf((o) => !o.email || o.phone)
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
