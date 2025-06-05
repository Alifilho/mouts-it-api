import { HttpStatus, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const responseTime = Date.now() - startTime;

      const message = `${method} ${originalUrl} ${statusCode} ${responseTime}ms ${contentLength} - ${userAgent} ${ip}`;

      if (statusCode >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
        this.logger.error(message);
      } else if (statusCode >= Number(HttpStatus.BAD_REQUEST)) {
        this.logger.warn(message);
      } else {
        this.logger.log(message);
      }
    });

    next();
  }
}
