import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TasksModule } from './tasks/task.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './tasks/entity/task.entity.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configSchema } from './config/configuration.js';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        appKey: config.getOrThrow<string>('APP_KEY'),
        appSecret: config.getOrThrow<string>('APP_SECRET'),
        serviceId: 'dev-sec-ops',  
      })
    }),
    TasksModule,
    TypeOrmModule.forRootAsync({ // Setup Config for Postgres database
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.getOrThrow<number>('DB_PORT'),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        entities: [Task],
        synchronize: false // Make sure typeorm doesnt change database when entity changes, but follow migration as source of truth. 
                          // Reason for using migration is because of logs. If typeorm change database when entity changes, its hard to check what has been changed and which version it is, and the data inside database might be broken
      })
    }),

    ConfigModule.forRoot({ // Setup configuration
      envFilePath:  // default .env, fallback use .env.test for testing database
        process.env.NODE_ENV === 'test'
          ? '.env.test'
          : '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      isGlobal: true, // Set config to global so other module doesnt have to import ConfigModule and can directly call ConfigService
      validationSchema: configSchema // Follow Zod Schema listed in configSchema
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Apply our custom Logger Middleware at all routes
  }
}
