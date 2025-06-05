import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from 'generated/prisma';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<Request>();
    const response = host.switchToHttp().getResponse<Response>();

    this.logger.error(
      `Database error: ${[exception.code, exception.message, request.url].join(' - ')}`,
      exception.stack,
    );

    const body = {
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    if (exception.code === 'P2025') {
      return response.status(HttpStatus.NOT_FOUND).json({
        ...body,
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Not Found',
      });
    }
    if (exception.code === 'P2002') {
      return response.status(HttpStatus.CONFLICT).json({
        ...body,
        statusCode: HttpStatus.CONFLICT,
        message: 'Conflict',
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      ...body,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    });
  }
}
