import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('top-genres')
  topGenres() {
    return this.service.getTopGenres();
  }

  @Get('suggest-friends/:userId')
  suggestFriends(@Param('userId') userId: string) {
    return this.service.suggestFriends(userId);
  }
}
