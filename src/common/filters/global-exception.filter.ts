import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

type ErrorResponse = {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
};

const databaseUnavailableCodes = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ENOTFOUND',
  'ETIMEDOUT',
  '57P01',
  '57P02',
  '57P03',
]);

/**
 * Keeps internal failures in server logs while giving every API client the
 * same safe error shape. Expected Nest HTTP exceptions keep their status;
 * unknown failures become 500 responses.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const requestId = this.getRequestId(response);
    const status = this.getStatus(exception);
    const body: ErrorResponse = {
      error: {
        code: this.getErrorCode(status),
        message: this.getPublicMessage(exception, status),
        requestId,
      },
    };

    const logMessage = `${request.method} ${request.originalUrl} failed with ${status} (requestId=${requestId})`;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(logMessage);
    }

    response.status(status).json(body);
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (this.isDatabaseUnavailable(exception)) {
      return HttpStatus.SERVICE_UNAVAILABLE;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getPublicMessage(exception: unknown, status: number): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return response;
      }

      if (typeof response === 'object' && response !== null) {
        const message = (response as { message?: unknown }).message;
        if (typeof message === 'string') {
          return message;
        }
      }
    }

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Invalid request.';
      case HttpStatus.UNAUTHORIZED:
        return 'Authentication is required.';
      case HttpStatus.FORBIDDEN:
        return 'You do not have permission to perform this action.';
      case HttpStatus.NOT_FOUND:
        return 'The requested resource was not found.';
      case HttpStatus.CONFLICT:
        return 'The request conflicts with the current resource state.';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too many requests. Please try again later.';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'The service is temporarily unavailable. Please try again later.';
      default:
        return 'Internal server error.';
    }
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMITED';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'INTERNAL_ERROR';
    }
  }

  private getRequestId(response: Response): string {
    const requestId = response.getHeader('X-Request-Id');
    return typeof requestId === 'string' ? requestId : 'unknown';
  }

  private isDatabaseUnavailable(exception: unknown, seen = new Set<object>()): boolean {
    if (typeof exception !== 'object' || exception === null) {
      return false;
    }

    if (seen.has(exception)) {
      return false;
    }
    seen.add(exception);

    const candidate = exception as { code?: unknown; cause?: unknown };
    if (
      typeof candidate.code === 'string' &&
      databaseUnavailableCodes.has(candidate.code)
    ) {
      return true;
    }

    return this.isDatabaseUnavailable(candidate.cause, seen);
  }
}
