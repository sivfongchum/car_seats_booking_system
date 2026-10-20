import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { UserRole } from '../../users/enums/role.enum.js';

export class RegisterDto {
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
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
