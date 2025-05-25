import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ArtistAnalytics } from "./entities/artist-analytics.entity"
import { TrackAnalytics } from "./entities/track-analytics.entity"
import { RevenueAnalytics } from "./entities/revenue-analytics.entity"
import { AnalyticsDataService } from "./services/analytics-data.service"
import { AnalyticsDashboardService } from "./services/analytics-dashboard.service"
import { AnalyticsExportService } from "./services/analytics-export.service"
import { AnalyticsDashboardController } from "./controllers/analytics-dashboard.controller"
import { AnalyticsStreamingController } from "./controllers/analytics-streaming.controller"

@Module({
  imports: [TypeOrmModule.forFeature([ArtistAnalytics, TrackAnalytics, RevenueAnalytics])],
  controllers: [AnalyticsDashboardController, AnalyticsStreamingController],
  providers: [AnalyticsDataService, AnalyticsDashboardService, AnalyticsExportService],
  exports: [AnalyticsDataService, AnalyticsDashboardService, AnalyticsExportService],
})
export class AnalyticsModule {}
