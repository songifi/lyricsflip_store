@Controller('charts')
export class ChartController {
  constructor(private readonly chartService: ChartService) {}

  @Post()
  create(@Body() dto: CreateChartEntryDto) {
    return this.chartService.createChartEntry(dto);
  }

  @Get('top/:metric')
  getTop(@Param('metric') metric: string, @Query('date') date: string) {
    return this.chartService.getTopTracks(metric, new Date(date));
  }

  @Post('milestone')
  addMilestone(@Body() body: { entryId: number, milestone: string }) {
    return this.chartService.addMilestone(body.entryId, body.milestone);
  }

  @Get('history/:trackId')
  getHistory(@Param('trackId') trackId: number) {
    return this.chartService.getChartHistory(trackId);
  }
}
