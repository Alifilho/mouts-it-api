import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof Error ? exception.message : String(exception);

    const body = {
      message,
      statusCode,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    if (statusCode === Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - Status ${statusCode}`,
        exception instanceof HttpException
          ? exception.getResponse()
          : String(exception),
      );
    }

    response.status(statusCode).json(body);
  }
}
