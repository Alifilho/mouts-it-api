import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
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
      return response.status(404).json({
        ...body,
        statusCode: 404,
        message: 'Not Found',
      });
    }
    if (exception.code === 'P2002') {
      return response.status(409).json({
        ...body,
        statusCode: 409,
        message: 'Conflict',
      });
    }

    return response.status(500).json({
      ...body,
      statusCode: 500,
      message: 'Internal Server Error',
    });
  }
}
