import { Inject, Injectable } from '@nestjs/common';
import type { AppConfig } from '../config/app.config.js';
import { APP_CONFIG } from './config.token.js';

/**
 * Single source of "today" for the whole API. Never use `new Date()` for
 * business logic: the brief fixes today so reviews are reproducible.
 */
@Injectable()
export class ClockService {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  today(): string {
    return this.config.today;
  }
}
