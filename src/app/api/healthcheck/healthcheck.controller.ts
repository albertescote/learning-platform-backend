import { Controller, Get, HttpCode } from '@nestjs/common';

@Controller('')
export class HealthcheckController {
  constructor() {}

  @Get('/')
  @HttpCode(200)
  create(): void {
    console.log('[GET /]: healthcheck request received');
    return;
  }
}
