@Module({
  imports: [TypeOrmModule.forFeature([
    AnalyticsEvent, MarketReport, Benchmark,
    // Add all entities used above
  ])],
  controllers: [
    TrendAnalysisController, ForecastingController, MarketResearchController,
    DemographicController, PredictiveController, BenchmarkingController, DashboardController,
    DataWarehouseController
  ],
  providers: [
    DataWarehouseService, TrendAnalysisService, ForecastingService,
    MarketResearchService, DemographicAnalysisService, PredictiveAnalyticsService,
    BenchmarkingService, DashboardService,
  ],
})
export class AnalyticsModule {}
