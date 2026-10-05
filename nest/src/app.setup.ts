import {
  HttpStatus,
  type INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import { AllExceptionsFilter } from './common/errors/all-exceptions.filter.js';
import { ApiException, ErrorCode } from './common/errors/api-error.js';

/** Global pipes and filters, shared by main.ts and the e2e tests so both run the same app. */
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) =>
        new ApiException(
          HttpStatus.BAD_REQUEST,
          ErrorCode.ValidationError,
          'Validation failed',
          flattenErrors(errors),
        ),
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
}

function flattenErrors(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...flattenErrors(error.children ?? []),
  ]);
}
