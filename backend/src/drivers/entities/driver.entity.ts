import { 
    Entity, 
    Column, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn, 
    OneToMany 
  } from 'typeorm';
  import { DriverStatusEnums } from '../enums/driver_status_enums.js';
  import { Trip } from '../../trips/entities/trip.entity.js';
  
  @Entity('drivers')
  export class Driver {
  
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
    name: string;
  
    @Column({ name: 'email', type: 'varchar', length: 100, nullable: false, unique: true })
    email: string;
  
    @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: false })
    phoneNumber: string;
  
 
    @Column({ 
      name: 'status', 
      type: 'varchar', 
      length: 20, 
      nullable: false, 
      default: DriverStatusEnums.ACTIVE, 
      enum: DriverStatusEnums 
    })
    status: DriverStatusEnums;
  
    
    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;
  
 
    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
  
    @OneToMany(() => Trip, (trip) => trip.driver)
    trips: Trip[];
  }