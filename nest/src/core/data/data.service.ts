import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { AppConfig } from '../../config/app.config.js';
import { isValidIsoDate } from '../../common/utils/date.util.js';
import { APP_CONFIG } from '../config.token.js';
import type {
  DocumentsFile,
  FlightHoursFile,
  SchedulesFile,
} from './data.types.js';

/**
 * In-memory data store seeded from the mock JSON files once at boot.
 * Read-only: feature services query it, nothing writes back.
 */
@Injectable()
export class DataService {
  private readonly logger = new Logger(DataService.name);

  readonly flightHours: FlightHoursFile;
  readonly documents: DocumentsFile;
  readonly schedules: SchedulesFile;
  /** Daily hours keyed by date, for O(1) lookups in rolling sums. */
  readonly hoursByDate: ReadonlyMap<string, number>;
  /** Earliest date with a flight-hours record; windows starting before it are incomplete. */
  readonly firstFlightDate: string;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.flightHours = this.load<FlightHoursFile>(
      config.dataDir,
      'mock-flight-hours.json',
    );
    this.documents = this.load<DocumentsFile>(
      config.dataDir,
      'mock-documents.json',
    );
    this.schedules = this.load<SchedulesFile>(
      config.dataDir,
      'mock-schedules.json',
    );

    this.hoursByDate = indexFlightHours(this.flightHours.flightHours);
    // Don't rely on the file being sorted.
    this.firstFlightDate = [...this.hoursByDate.keys()].sort()[0] ?? '';
    this.schedules.schedules.sort((a, b) =>
      a.duty_date.localeCompare(b.duty_date),
    );

    this.logger.log(
      `Loaded ${this.hoursByDate.size} flight-hour days, ` +
        `${this.documents.documents.length} documents, ` +
        `${this.schedules.schedules.length} schedule entries`,
    );
  }

  private load<T>(dir: string, file: string): T {
    const path = join(dir, file);
    try {
      return JSON.parse(readFileSync(path, 'utf8')) as T;
    } catch (error) {
      throw new Error(
        `Could not load data file ${path}: ${(error as Error).message}`,
      );
    }
  }
}

/** Builds the date → hours index, rejecting bad rows so the rolling sum can trust its input. */
export function indexFlightHours(
  rows: { date: string; hours: number }[],
): Map<string, number> {
  const index = new Map<string, number>();
  for (const { date, hours } of rows) {
    if (
      !isValidIsoDate(date) ||
      !Number.isFinite(hours) ||
      hours < 0 ||
      hours > 24
    ) {
      throw new Error(
        `Invalid flight-hours row: ${JSON.stringify({ date, hours })}`,
      );
    }
    if (index.has(date))
      throw new Error(`Duplicate flight-hours date: ${date}`);
    index.set(date, hours);
  }
  return index;
}
