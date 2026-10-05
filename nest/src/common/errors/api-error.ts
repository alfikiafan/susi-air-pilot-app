import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HttpException, HttpStatus } from '@nestjs/common';

/** Machine-readable codes so clients branch on `code`, never on message text. */
export enum ErrorCode {
  ValidationError = 'VALIDATION_ERROR',
  InvalidCredentials = 'INVALID_CREDENTIALS',
  Unauthorized = 'UNAUTHORIZED',
  NotFound = 'NOT_FOUND',
  BadRequest = 'BAD_REQUEST',
  InternalError = 'INTERNAL_ERROR',
}

/** The one error shape every endpoint returns. */
export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ enum: ErrorCode, example: ErrorCode.ValidationError })
  code: ErrorCode | string;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['range must be one of the following values: 1w, 1m, 3m, 6m, 1y'],
  })
  details?: string[];

  @ApiProperty({ example: '/flight-hours/summary' })
  path: string;

  @ApiProperty({ example: '2026-05-15T08:00:00.000Z' })
  timestamp: string;
}

/** HttpException that carries an explicit error code (and optional details) through to the filter. */
export class ApiException extends HttpException {
  constructor(
    status: HttpStatus,
    readonly code: ErrorCode,
    message: string,
    readonly details?: string[],
  ) {
    super(message, status);
  }
}
