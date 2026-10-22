import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, type Relation, JoinColumn } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity.js';
import { Seat } from '../../seats/entities/seat.entity.js';
import { SeatBookingEnums } from '../enums/seat_booking_enums.js';
@Entity('booking_seats')
export class BookingSeat {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column({name : "booking_id", type: "varchar", nullable: false})
    bookingId: string;

    @Column({name : "seat_id", type: "uuid", nullable: false})
    seatId: string;

    @Column({name : "price", type: "numeric", nullable: false})
    price: number;

    @Column({ name: "status", type: "varchar", length: 20, nullable: false, enum: SeatBookingEnums, default: SeatBookingEnums.HELD })
    status: SeatBookingEnums;

    @ManyToOne(() => Booking, (booking) => booking.bookingSeats)
    @JoinColumn({ name: "booking_id" })
    booking: Relation<Booking>;

    @ManyToOne(() => Seat, (seat) => seat.bookingSeats)
    @JoinColumn({ name: "seat_id" })    
    seat: Relation<Seat>;

}
