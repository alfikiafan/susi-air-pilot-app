import { isAbsolute, resolve } from 'node:path';
import { isValidIsoDate } from '../common/utils/date.util.js';

export interface AppConfig {
  port: number;
  /** The app's notion of "today". Fixed so every review sees the same numbers. */
  today: string;
  jwtSecret: string;
  jwtExpiresIn: number;
  corsOrigins: string[];
  dataDir: string;
}

export const DEFAULT_TODAY = '2026-05-15';

/** Reads and validates environment variables once at boot; throws on bad values so misconfiguration fails fast. */
export function loadAppConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const today = env.TODAY ?? DEFAULT_TODAY;
  if (!isValidIsoDate(today)) {
    throw new Error(`TODAY must be a valid YYYY-MM-DD date, got "${today}"`);
  }

  const isProduction = env.NODE_ENV === 'production';
  const jwtSecret = env.JWT_SECRET ?? (isProduction ? '' : 'dev-only-secret');
  if (!jwtSecret) throw new Error('JWT_SECRET is required in production');

  const dataDir = env.DATA_DIR ?? 'data';

  return {
    port: Number(env.PORT ?? 3001),
    today,
    jwtSecret,
    jwtExpiresIn: Number(env.JWT_EXPIRES_IN_SECONDS ?? 60 * 60 * 12),
    corsOrigins: (env.CORS_ORIGIN ?? 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    dataDir: isAbsolute(dataDir) ? dataDir : resolve(process.cwd(), dataDir),
  };
}
