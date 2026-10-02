import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health') // Routes for testing API Health
  health() {
    return this.appService.health();
  }

  @Get('ready') // Routes for testing database health
  ready() {
    return this.appService.ready();
  }
}
