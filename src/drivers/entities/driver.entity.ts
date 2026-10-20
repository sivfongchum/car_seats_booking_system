import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, type Relation, JoinColumn, OneToMany } from 'typeorm';
import { DriverStatusEnums } from '../enums/driver_status_enums.js';
import { Trip } from '../../trips/entities/trip.entity.js';
@Entity('drivers')
export class Driver {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: "name", type: "varchar", length: 100, nullable: false })
    name: string;

    @Column({ name: "email", type: "varchar", length: 100, nullable: false })
    email: string;

    @Column({ name: "phone_number", type: "varchar", length: 20, nullable: false })
    phoneNumber: string;

    @Column({ name : "status", type: "varchar", length: 20, nullable: false , enum: DriverStatusEnums})
    status: DriverStatusEnums.ACTIVE;

    @Column({name : "created_at", type: "timestamptz"})
    createdAt: Date;

    @OneToMany(() => Trip, (trip) => trip.driver)
    trips: Trip[];
}
