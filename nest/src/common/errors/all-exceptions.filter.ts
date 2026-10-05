import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiException, ErrorCode, ErrorResponseDto } from './api-error.js';

const CODE_BY_STATUS: Partial<Record<number, ErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: ErrorCode.BadRequest,
  [HttpStatus.UNAUTHORIZED]: ErrorCode.Unauthorized,
  [HttpStatus.NOT_FOUND]: ErrorCode.NotFound,
};

/**
 * Turns every thrown error into an ErrorResponseDto. Unknown errors become a
 * generic 500 so internals never leak to the client; they are logged instead.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const body = this.toBody(exception, request.originalUrl ?? request.url);
    if (body.statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.originalUrl} failed`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }
    response.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown, path: string): ErrorResponseDto {
    const timestamp = new Date().toISOString();

    if (exception instanceof ApiException) {
      return {
        statusCode: exception.getStatus(),
        code: exception.code,
        message: exception.message,
        ...(exception.details && { details: exception.details }),
        path,
        timestamp,
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const res = exception.getResponse();
      const raw =
        typeof res === 'string' ? res : (res as { message?: unknown }).message;
      const messages = Array.isArray(raw) ? raw.map(String) : undefined;
      return {
        statusCode,
        code: CODE_BY_STATUS[statusCode] ?? HttpStatus[statusCode] ?? 'ERROR',
        message: messages
          ? 'Request failed'
          : typeof raw === 'string'
            ? raw
            : exception.message,
        ...(messages && { details: messages }),
        path,
        timestamp,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.InternalError,
      message: 'Internal server error',
      path,
      timestamp,
    };
  }
}
