 
import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { Route } from '../../routes/entities/route.entity.js';
import { Vehicle } from '../../vehicles/entities/vehicle.entity.js';
import { Driver } from '../../drivers/entities/driver.entity.js';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'route_id', type: 'uuid', nullable: false })
  routeId: string;

  @Column({ name: 'vehicle_id', type: 'uuid', nullable: true })
  vehicleId: string;

  @Column({ name: 'driver_id', type: 'uuid', nullable: true })
  driverId: string;

  @Column({ name: 'departure_time', type: 'time', nullable: false })
  departureTime: string; // "06:30:00"

  @Column({ name: 'estimated_duration_minutes', type: 'integer', nullable: false })
  estimatedDurationMinutes: number;

  @Column({ name: 'days_of_week', type: 'smallint', array: true, default: [1, 2, 3, 4, 5, 6, 7] })
  daysOfWeek: number[];  

  @Column({ name: 'price', type: 'numeric', nullable: false })
  price: number;

  @Column({ name: 'currency', type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Route)
  @JoinColumn({ name: 'route_id' })
  route: Route;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ManyToOne(() => Driver)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;
}