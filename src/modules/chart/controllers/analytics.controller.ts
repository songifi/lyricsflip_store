@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('geo/:metric')
  getGeo(@Param('metric') metric: string, @Query('date') date: string) {
    return this.analyticsService.getGeoAnalytics(metric, new Date(date));
  }

  @Get('demo/:metric')
  getDemo(@Param('metric') metric: string, @Query('date') date: string) {
    return this.analyticsService.getDemographics(metric, new Date(date));
  }
}
