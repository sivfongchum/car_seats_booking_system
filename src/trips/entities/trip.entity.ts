import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, type Relation, JoinColumn } from 'typeorm';
import { TripStatusEnums } from '../enums/trip_status_enums.js';
import { Driver } from '../../drivers/entities/driver.entity.js';
import { Vehicle } from '../../vehicles/entities/vehicle.entity.js';
import { Route } from '../../routes/entities/route.entity.js';
@Entity('trips')
export class Trip {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name : 'route_id', type: "varchar", nullable: false})
    routeId: string;

    @Column({ name : 'vehicle_id', type: "varchar", nullable: false})
    vehicleId: string;

    @Column({name : 'driver_id', type: "varchar", nullable: false})
    driverId: string;

    @Column({name : 'status', type: "varchar", length: 20, nullable: false , enum: TripStatusEnums})
    status: TripStatusEnums.PENDING;

    @Column({name : 'departure_date', type: "timestamptz"})
    departureDate: Date;

    @Column({name : 'arrive_date', type: "timestamptz"})
    arriveAt: Date;

    @Column({name : 'price_per_seat', type: "numeric", nullable: false})
    pricePerSeat: number;

    @Column({name : "currency", type: "varchar", length: 10, nullable: false})
    currency: string;

    @Column({name : 'created_at', type: "timestamptz"})
    createdAt: Date;   
    
    @ManyToOne(() => Driver, (driver) => driver.trips)
    @JoinColumn({ name: "driver_id" })
    driver: Relation<Driver>;

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.trips)
    @JoinColumn({ name: "vehicle_id" })
    vehicle: Relation<Vehicle>;

    @ManyToOne(() => Route, (route) => route.trips)
    @JoinColumn({ name: "route_id" })    
    route: Relation<Route>;
 

}
