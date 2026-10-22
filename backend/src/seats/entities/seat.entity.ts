import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, type Relation, JoinColumn, OneToMany } from 'typeorm';
import { SeatStatusEnums } from '../enums/seat_status_enums.js';
import { Vehicle } from '../../vehicles/entities/vehicle.entity.js';
import { BookingSeat } from '../../booking_seats/entities/booking_seat.entity.js';
import { SeatTypeEnums } from '../enums/seat_type_enums.js';
@Entity('seats')
export class Seat {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({name : "vehicle_id", type: "varchar", nullable: false})
    vehicleId: string;

    @Column({name : "seat_number", type: "integer", nullable: false})
    seatNumber: number;
  
    @Column({name : "seat_type", type: "varchar", length: 20, nullable: false , enum: SeatTypeEnums, default: SeatTypeEnums.NORMAL})
    seatType: SeatTypeEnums;

    @Column({name : "status", type: "varchar", length: 20, nullable: false, enum: SeatStatusEnums, default: SeatStatusEnums.AVAILABLE})
    status: SeatStatusEnums;

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.seats, {onDelete: 'CASCADE'})
    @JoinColumn({ name: "vehicle_id" })
    vehicle: Relation<Vehicle>;

    @OneToMany(() => BookingSeat, (bookingSeat) => bookingSeat.seat)
    bookingSeats: BookingSeat[];

}
