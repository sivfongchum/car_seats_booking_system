import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { fullName, email, phone, password, role } = createUserDto;

    if (!email && !phone) {
      throw new BadRequestException('Either email or phone must be provided.');
    }

    if (email) {
      const existingEmail = await this.findByEmail(email);
      if (existingEmail) {
        throw new ConflictException('Email is already registered.');
      }
    }

    if (phone) {
      const existingPhone = await this.findByPhone(phone);
      if (existingPhone) {
        throw new ConflictException('Phone number is already registered.');
      }
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = this.userRepository.create({
      fullName,
      email: email ? email.toLowerCase().trim() : null,
      phone: phone ? phone.trim() : null,
      passwordHash,
      role,
      isActive: true,
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phone: phone.trim() },
    });
  }

  async findByEmailOrPhone(identifier: string): Promise<User | null> {
    const trimmed = identifier.trim();
    const userByEmail = await this.userRepository.findOne({
      where: { email: trimmed.toLowerCase() },
    });
    if (userByEmail) {
      return userByEmail;
    }
    return this.userRepository.findOne({
      where: { phone: trimmed },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    if (updateUserDto.fullName !== undefined) {
      user.fullName = updateUserDto.fullName;
    }

    if (updateUserDto.email !== undefined) {
      const existing = await this.findByEmail(updateUserDto.email);
      if (existing && existing.id !== id) {
        throw new ConflictException('Email already in use.');
      }
      user.email = updateUserDto.email.toLowerCase().trim();
    }

    if (updateUserDto.phone !== undefined) {
      const existing = await this.findByPhone(updateUserDto.phone);
      if (existing && existing.id !== id) {
        throw new ConflictException('Phone already in use.');
      }
      user.phone = updateUserDto.phone.trim();
    }

    if (updateUserDto.password) {
      user.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.role !== undefined) {
      user.role = updateUserDto.role;
    }

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
  }
}
