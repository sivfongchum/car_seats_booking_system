import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtPayload } from './strategies/jwt.strategy.js';

export interface SanitizedUser {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    const token = await this.generateToken(user);
    return {
      message: 'User registered successfully.',
      user: this.sanitizeUser(user),
      accessToken: token,
    };
  }

  async login(loginDto: LoginDto) {
    const identifier = loginDto.identifier || loginDto.email || loginDto.phone;

    if (!identifier) {
      throw new BadRequestException('Please provide an email or phone number to log in.');
    }

    const user = await this.usersService.findByEmailOrPhone(identifier);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated. Please contact support.');
    }

    const token = await this.generateToken(user);

    return {
      message: 'Login successful.',
      user: this.sanitizeUser(user),
      accessToken: token,
    };
  }

  async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
    return this.jwtService.signAsync(payload);
  }

  setAuthCookie(response: Response, token: string): void {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const maxAgeMs = 24 * 60 * 60 * 1000; // 1 day

    response.cookie('access_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: maxAgeMs,
      path: '/',
    });
  }

  clearAuthCookie(response: Response): void {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    response.clearCookie('access_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });
  }

  sanitizeUser(user: User): SanitizedUser {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
