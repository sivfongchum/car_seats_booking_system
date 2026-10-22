// src/routes/entities/route.entity.ts
import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, // <-- Add this import
  OneToMany 
} from 'typeorm';
import { Trip } from '../../trips/entities/trip.entity.js';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'origin', type: 'varchar', length: 100, nullable: false })
  origin: string;

  @Column({ name: 'destination', type: 'varchar', length: 100, nullable: false })
  destination: string;

  @Column({ name: 'estimated_duration_minutes', type: 'integer', nullable: false })
  estimatedDurationMinutes: number;

  @Column({ name: 'distance_km', type: 'integer', nullable: false })
  distance: number;

  @Column({ name: 'base_price', type: 'numeric', nullable: false })
  basePrice: number;

  @Column({ name: 'currency', type: 'varchar', length: 10, nullable: false })
  currency: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

 
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => Trip, (trip) => trip.route)
  trips: Trip[];
}