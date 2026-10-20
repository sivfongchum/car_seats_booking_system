import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne, type Relation, JoinColumn } from 'typeorm';
import { PaymentStatus } from '../enums/payment_satatus-enums.js';
import { Booking } from '../../bookings/entities/booking.entity.js';
import { PaymentMethodEnums } from '../enums/payment_mathod_enums.js';
@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: "booking_id" })
    bookingId: string;

    @Column({ name: "amount" })
    amount: number;

    @Column({ name: "currency" })
    currency: string;

    @Column({ name: "payment_method" , enum: PaymentMethodEnums, nullable: false })
    paymentMethod: PaymentMethodEnums.ABA;

    @Column({ name: "transaction_reference", length: 255, unique: true, nullable: false })
    transactionReference: string;

    @Column({ name: "payment_status", enum: PaymentStatus, default: PaymentStatus.PENDING })
    paymentStatus: PaymentStatus.PENDING;

    @Column({ name: "payment_date", nullable: true })
    paymentDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Booking, (booking) => booking.payments)
    @JoinColumn({ name: "booking_id" })
    booking: Relation<Booking>;

}
