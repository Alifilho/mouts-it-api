import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { utilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          utilities.format.nestLike('Mouts', {
            colors: true,
            prettyPrint: true,
            processId: true,
            appName: true,
          }),
        ),
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, { logger });

  const config = new DocumentBuilder()
    .setTitle('API Mouts')
    .setDescription('API for and user management')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
