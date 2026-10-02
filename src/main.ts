import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AllExceptionFilter } from './common/exception/all-exception-filter.js';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
  });

  app.setGlobalPrefix('api'); // Set global route to be /api/...

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1' // Enable API versioning for future version control, /api/v1/...
  });

  app.useGlobalPipes(new ValidationPipe({ // Include Validation Pipe for validating routes
    whitelist: true, // remove returned value that doesnt use Validation decoration
    forbidNonWhitelisted: true, // instead of removing returned value throw an error
    transform: true // transform payload into dto classes automatically globally
  }));

  app.useGlobalFilters(new AllExceptionFilter()); // Use exception filter

  await app.listen(process.env.PORT ?? 3000); // Listen at port 3000 for backend
}
await bootstrap();
