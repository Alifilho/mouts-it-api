import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { PerformanceInterceptor } from './interceptors/performance.interceptor';
import { HttpLoggerMiddleware } from './middleware/http-logger.middleware';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'config/.env' }),
    PrismaModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Logger,
    { provide: APP_INTERCEPTOR, useClass: PerformanceInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
