import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { connectDb } from './config/connectDb.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { TripsModule } from './trips/trips.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { BookingSeatsModule } from './booking_seats/booking_seats.module.js';
import { VehiclesModule } from './vehicles/vehicles.module.js';
import { SeatsModule } from './seats/seats.module.js';
import { DriversModule } from './drivers/drivers.module.js';
import { RoutesModule } from './routes/routes.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(connectDb),
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'Online Car Seat Booking System',
    }),
    UsersModule,
    AuthModule,
    BookingsModule,
    TripsModule,
    PaymentsModule,
    BookingSeatsModule,
    VehiclesModule,
    SeatsModule,
    DriversModule,
    RoutesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
