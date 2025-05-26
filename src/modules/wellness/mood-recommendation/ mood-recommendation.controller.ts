import { Controller, Get, Post, Body, Query, UseGuards, Request } from "@nestjs/common"
import type { MoodRecommendationService } from "./mood-recommendation.service"
import type { CreateMoodEntryDto } from "../dto/mood-entry.dto"
import type { MoodType, EnergyLevel, StressLevel } from "../../../database/entities/mood-entry.entity"
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard"

@Controller("wellness/mood")
@UseGuards(JwtAuthGuard)
export class MoodRecommendationController {
  constructor(private readonly moodRecommendationService: MoodRecommendationService) {}

  @Post("entry")
  async createMoodEntry(@Request() req, @Body() moodData: CreateMoodEntryDto) {
    return this.moodRecommendationService.createMoodEntry(req.user.id, moodData)
  }

  @Get("history")
  async getMoodHistory(@Request() req: any, @Query('days') days?: number) {
    return this.moodRecommendationService.getUserMoodHistory(req.user.id, days)
  }

  @Get("recommendations")
  async getRecommendations(
    @Query('mood') mood: MoodType,
    @Query('energy') energy: EnergyLevel,
    @Query('stress') stress: StressLevel,
  ) {
    return this.moodRecommendationService.getRecommendationsForMood(mood, energy, stress)
  }

  @Get('analytics')
  async getMoodAnalytics(@Request() req) {
    return this.moodRecommendationService.getMoodAnalytics(req.user.id);
  }
}
