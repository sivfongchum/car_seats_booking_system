import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * TypeORM PostgreSQL Database Configuration.
 * Loads connection parameters from environment variables via ConfigService.
 * Modify connection values directly in your `.env` file.
 */
export const connectDb: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: Number(configService.get<string | number>('DB_PORT', 5432)),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'postgres'),
    database: configService.get<string>('DB_NAME', 'car_seat_booking'),
    entities: [],
    autoLoadEntities: true,
    synchronize: configService.get<string>('NODE_ENV') !== 'production', // Auto-syncs schema in development; disable in production
    logging: configService.get<string>('NODE_ENV') !== 'production',
  }),
};

export default connectDb;
