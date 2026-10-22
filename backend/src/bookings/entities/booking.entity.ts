import { JoinColumn, ManyToOne, OneToMany, type Relation, Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { BookingStatus } from '../enums/booking-status.enum.js';
import { Payment } from '../../payments/entities/payment.entity.js';
import { BookingSeat } from '../../booking_seats/entities/booking_seat.entity.js';
@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: "booking_number", type: "varchar", length: 30, unique: true, nullable: false })
    bookingNumber: string;

    @Column({ name: "user_id", type: "varchar", nullable: false })
    userId: string;

    @Column({ name: "trip_id", type: "varchar", nullable: false })
    tripId: string;

    @Column({ name: "total_amount", type: "numeric", nullable: false })
    totalAmount: number;

    @Column({ name: "status", type: "enum", enum: BookingStatus, nullable: false, default: BookingStatus.PENDING })
    status: BookingStatus;

    @Column({ name: "currency", type: "varchar", length: 10, nullable: false })
    currency: string;

    @Column({ name: "expires_at", type: "timestamptz", nullable: true })
    expiresAt: Date;

    get bookingStatus(): BookingStatus {
        return this.status;
    }
    set bookingStatus(value: BookingStatus) {
        this.status = value;
    }

    get expireAt(): Date {
        return this.expiresAt;
    }
    set expireAt(value: Date) {
        this.expiresAt = value;
    }

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.bookings)
    @JoinColumn({ name: "user_id" })
    user: Relation<User>;

    @OneToMany(() => Payment, (payment) => payment.booking)
    payments: Payment[];

    @OneToMany(() => BookingSeat, (bookingSeat) => bookingSeat.booking)
    bookingSeats: BookingSeat[];
}
