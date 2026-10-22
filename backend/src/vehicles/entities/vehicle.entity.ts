import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne, type Relation, OneToMany } from 'typeorm';
import { VehicleStatusEnums } from '../enums/vehicle_status_enums.js';
import { Seat } from '../../seats/entities/seat.entity.js';
import { Trip } from '../../trips/entities/trip.entity.js';
@Entity('vehicles')
export class Vehicle {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: "plate_number", type: "varchar", length: 20, unique: true, nullable: false })
    plateNumber: string;

    @Column({ name: "vehicle_type", type: "varchar", length: 20, nullable: false })
    vehicleType: string;

    @Column({ name: "model", type: "varchar", length: 100, nullable: false })
    model: string;

    @Column({ name: "year", type: "integer", nullable: false })
    year: number;

    @Column({ name: "capacity", type: "integer", nullable: false })
    capacity: number;

    @Column({ name: "status", type: "varchar", length: 20, nullable: false, enum: VehicleStatusEnums, default: VehicleStatusEnums.ACTIVE })
    status: VehicleStatusEnums;

    @OneToMany(() => Seat, (seat) => seat.vehicle)
    seats: Seat[];

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    @OneToMany(() => Trip, (trip) => trip.vehicle)
    trips: Trip[];

}
