import { registerDecorator, ValidationOptions } from 'class-validator';
import { isValidIsoDate } from '../utils/date.util.js';

/** Accepts only real calendar dates in `YYYY-MM-DD` form (rejects 2026-02-30, 2026-5-1, timestamps). */
export function IsIsoDate(options?: ValidationOptions): PropertyDecorator {
  return (target, propertyName) =>
    registerDecorator({
      name: 'isIsoDate',
      target: target.constructor,
      propertyName: String(propertyName),
      options: {
        message: '$property must be a valid date in YYYY-MM-DD format',
        ...options,
      },
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && isValidIsoDate(value),
      },
    });
}
