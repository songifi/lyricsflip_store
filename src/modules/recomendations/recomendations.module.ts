import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationsService } from './services/recommendations.service';
import { RecommendationAnalyticsService } from './services/recommendation-analytics.service';
import { RealtimeUpdateService } from './services/realtime-update.service';
import { MLTrainingService } from './services/ml-training.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';
import { TrackInteractionDto } from './dto/track-interaction.dto';
import { RecommendationFeedbackDto } from './dto/recommendation-feedback.dto';
import { TrainModelDto } from './dto/train-model.dto';

@ApiTags('recommendations')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecommendationsController {
  constructor(
    private recommendationsService: RecommendationsService,
    private analyticsService: RecommendationAnalyticsService,
    private realtimeUpdateService: RealtimeUpdateService,
    private mlTrainingService: MLTrainingService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get personalized recommendations for user' })
  @ApiResponse({ status: 200, description: 'Recommendations retrieved successfully' })
  async getRecommendations(
    @GetUser() user: User,
    @Query() query: GetRecommendationsDto,
  ) {
    const recommendations = await this.recommendationsService.generateRecommendations(
      user.id,
      query.limit,
      query.algorithm,
    );

    return {
      success: true,
      data: recommendations,
      metadata: {
        userId: user.id,
        algorithm: query.algorithm,
        limit: query.limit,
        generatedAt: new Date(),
      },
    };
  }

  @Get('similar/:trackId')
  @ApiOperation({ summary: 'Get tracks similar to a specific track' })
  @ApiResponse({ status: 200, description: 'Similar tracks retrieved successfully' })
  async getSimilarTracks(
    @GetUser() user: User,
    @Param('trackId') trackId: string,
    @Query('limit') limit: number = 10,
  ) {
    const similarTracks = await this.recommendationsService.getSimilarTracks(
      trackId,
      user.id,
      limit,
    );

    return {
      success: true,
      data: similarTracks,
      metadata: {
        baseTrackId: trackId,
        userId: user.id,
        limit,
      },
    };
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending recommendations' })
  @ApiResponse({ status: 200, description: 'Trending recommendations retrieved successfully' })
  async getTrendingRecommendations(
    @GetUser() user: User,
    @Query('limit') limit: number = 20,
  ) {
    const trending = await this.recommendationsService.getTrendingRecommendations(
      user.id,
      limit,
    );

    return {
      success: true,
      data: trending,
      metadata: {
        userId: user.id,
        limit,
        type: 'trending',
      },
    };
  }

  @Post('interaction')
  @ApiOperation({ summary: 'Track user interaction with a track' })
  @ApiResponse({ status: 201, description: 'Interaction tracked successfully' })
  async trackInteraction(
    @GetUser() user: User,
    @Body() interactionDto: TrackInteractionDto,
  ) {
    await this.realtimeUpdateService.processUserInteraction({
      userId: user.id,
      trackId: interactionDto.trackId,
      interactionType: interactionDto.interactionType,
      timestamp: new Date(),
      context: interactionDto.context,
    });

    return {
      success: true,
      message: 'Interaction tracked successfully',
    };
  }

  @Post('feedback')
  @ApiOperation({ summary: 'Provide feedback on a recommendation' })
  @ApiResponse({ status: 201, description: 'Feedback recorded successfully' })
  async provideFeedback(
    @GetUser() user: User,
    @Body() feedbackDto: RecommendationFeedbackDto,
  ) {
    await this.recommendationsService.recordFeedback(
      user.id,
      feedbackDto.recommendationId,
      feedbackDto.feedbackType,
      feedbackDto.comment,
    );

    return {
      success: true,
      message: 'Feedback recorded successfully',
    };
  }

  @Get('explanation/:recommendationId')
  @ApiOperation({ summary: 'Get explanation for a specific recommendation' })
  @ApiResponse({ status: 200, description: 'Explanation retrieved successfully' })
  async getRecommendationExplanation(
    @GetUser() user: User,
    @Param('recommendationId') recommendationId: string,
  ) {
    const explanation = await this.recommendationsService.getRecommendationExplanation(
      recommendationId,
      user.id,
    );

    return {
      success: true,
      data: explanation,
    };
  }

  @Get('analytics/performance')
  @ApiOperation({ summary: 'Get recommendation performance analytics' })
  @ApiResponse({ status: 200, description: 'Performance analytics retrieved successfully' })
  async getPerformanceAnalytics(
    @GetUser() user: User,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('algorithm') algorithm?: string,
  ) {
    const timeRange = {
      start: new Date(startDate),
      end: new Date(endDate),
    };

    const performance = await this.analyticsService.getRecommendationPerformance(
      timeRange,
      algorithm,
    );

    return {
      success: true,
      data: performance,
      metadata: {
        timeRange,
        algorithm,
      },
    };
  }

  @Get('analytics/report')
  @ApiOperation({ summary: 'Generate comprehensive analytics report' })
  @ApiResponse({ status: 200, description: 'Analytics report generated successfully' })
  async generateAnalyticsReport(
    @GetUser() user: User,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const timeRange = {
      start: new Date(startDate),
      end: new Date(endDate),
    };

    const report = await this.analyticsService.generatePerformanceReport(timeRange);

    return {
      success: true,
      data: report,
    };
  }

  @Post('train')
  @ApiOperation({ summary: 'Trigger ML model training' })
  @ApiResponse({ status: 202, description: 'Model training initiated successfully' })
  async trainModel(
    @GetUser() user: User,
    @Body() trainDto: TrainModelDto,
  ) {
    await this.mlTrainingService.scheduleModelTraining({
      modelType: trainDto.modelType,
      parameters: trainDto.parameters,
      validationSplit: trainDto.validationSplit || 0.2,
      epochs: trainDto.epochs || 100,
      batchSize: trainDto.batchSize || 32,
    });

    return {
      success: true,
      message: 'Model training initiated successfully',
      data: {
        modelType: trainDto.modelType,
        estimatedCompletionTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour estimate
      },
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh user recommendations' })
  @ApiResponse({ status: 200, description: 'Recommendations refreshed successfully' })
  async refreshRecommendations(
    @GetUser() user: User,
  ) {
    await this.realtimeUpdateService.updateUserRecommendations(user.id, true);

    return {
      success: true,
      message: 'Recommendations refreshed successfully',
    };
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user recommendation profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getUserProfile(
    @GetUser() user: User,
  ) {
    const profile = await this.recommendationsService.getUserProfile(user.id);

    return {
      success: true,
      data: profile,
    };
  }
}