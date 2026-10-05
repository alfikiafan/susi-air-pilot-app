import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { CoreModule } from './core/core.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { FlightHoursModule } from './flight-hours/flight-hours.module.js';
import { PilotModule } from './pilot/pilot.module.js';
import { SchedulesModule } from './schedules/schedules.module.js';

@Module({
  imports: [
    // Loads .env into process.env before CoreModule reads it.
    ConfigModule.forRoot(),
    CoreModule,
    AuthModule,
    PilotModule,
    FlightHoursModule,
    DocumentsModule,
    SchedulesModule,
  ],
})
export class AppModule {}
