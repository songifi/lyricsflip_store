import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {
  RevenueByTimeframeDto,
  ArtistAnalyticsDto,
  TopSellingItemsDto,
} from './dto/analytics.dto';
import { AuthGuard } from '../auth/auth.guard'; // Replace with your actual auth guard
import { ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('global-metrics')
  async getGlobalSalesMetrics() {
    return this.analyticsService.getGlobalSalesMetrics();
  }

  @Get('artist')
  async getArtistAnalytics(@Query() query: ArtistAnalyticsDto) {
    return this.analyticsService.getArtistAnalytics(query.artistId);
  }

  @Get('revenue')
  async getRevenueByTimeframe(@Query() query: RevenueByTimeframeDto) {
    const { timeframe, artistId } = query;
    return this.analyticsService.getRevenueByTimeframe(timeframe, artistId);
  }

  @Get('top-selling')
  async getTopSellingItems(@Query() query: TopSellingItemsDto) {
    const { timeframe, artistId } = query;
    return this.analyticsService.getTopSellingItems(timeframe, artistId);
  }
}
