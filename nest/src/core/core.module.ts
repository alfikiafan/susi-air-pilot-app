import { Global, Module } from '@nestjs/common';
import { loadAppConfig } from '../config/app.config.js';
import { ClockService } from './clock.service.js';
import { APP_CONFIG } from './config.token.js';
import { DataService } from './data/data.service.js';

@Global()
@Module({
  providers: [
    { provide: APP_CONFIG, useFactory: () => loadAppConfig() },
    ClockService,
    DataService,
  ],
  exports: [APP_CONFIG, ClockService, DataService],
})
export class CoreModule {}
