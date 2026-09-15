import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready() {
    const ready = await this.healthService.isDatabaseReady();
    if (!ready) {
      throw new ServiceUnavailableException({
        status: 'unavailable',
        dependency: 'database',
      });
    }

    return { status: 'ok', dependency: 'database' };
  }
}
