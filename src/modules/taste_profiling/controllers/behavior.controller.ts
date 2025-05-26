import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { BehaviorService } from '../services/behavior.service';
import { LogBehaviorDto } from '../dto/log-behavior.dto';

@Controller('behavior')
export class BehaviorController {
  constructor(private readonly service: BehaviorService) {}

  @Post(':userId')
  log(@Param('userId') userId: string, @Body() dto: LogBehaviorDto) {
    return this.service.logBehavior(userId, dto);
  }

  @Get('patterns/:userId')
  analyze(@Param('userId') userId: string) {
    return this.service.analyzePatterns(userId);
  }
}
