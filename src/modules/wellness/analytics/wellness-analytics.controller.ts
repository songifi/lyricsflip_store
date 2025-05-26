import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from "@nestjs/common"
import type { WellnessAnalyticsService } from "./wellness-analytics.service"
import type { OutcomeType } from "../../../database/entities/wellness-outcome.entity"
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard"

@Controller("wellness/analytics")
@UseGuards(JwtAuthGuard)
export class WellnessAnalyticsController {
  constructor(private readonly analyticsService: WellnessAnalyticsService) {}

  @Post("outcomes")
  async createOutcome(@Request() req: any, @Body() outcomeData: any) {
    return this.analyticsService.createOutcome({
      userId: req.user.id,
      ...outcomeData,
    })
  }

  @Get('outcomes')
  async getUserOutcomes(@Request() req: any) {
    return this.analyticsService.getUserOutcomes(req.user.id);
  }

  @Get("outcomes/:type")
  async getOutcomesByType(@Request() req, @Param('type') type: OutcomeType) {
    return this.analyticsService.getOutcomesByType(req.user.id, type)
  }

  @Get("report")
  async getWellnessReport(@Request() req, @Query('days') days?: number) {
    return this.analyticsService.getWellnessReport(req.user.id, days || 30)
  }

  @Get("popular-programs")
  async getPopularPrograms() {
    return this.analyticsService.getPopularPrograms()
  }
}
