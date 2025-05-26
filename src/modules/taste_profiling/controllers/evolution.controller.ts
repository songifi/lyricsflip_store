import { Controller, Post, Param, Get } from '@nestjs/common';
import { EvolutionService } from '../services/evolution.service';

@Controller('evolution')
export class EvolutionController {
  constructor(private readonly service: EvolutionService) {}

  @Post('snapshot/:userId')
  takeSnapshot(@Param('userId') userId: string) {
    return this.service.snapshot(userId);
  }

  @Get('timeline/:userId')
  getTimeline(@Param('userId') userId: string) {
    return this.service.getTimeline(userId);
  }
}
