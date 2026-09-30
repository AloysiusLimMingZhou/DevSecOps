import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { NestExpressApplication } from '@nestjs/platform-express';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { AllExceptionFilter } from './common/exception/all-exception-filter.js';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
  });

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI
  });

  app.useGlobalFilters(new AllExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
