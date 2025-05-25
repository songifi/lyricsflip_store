@Controller('trending')
export class TrendingController {
  constructor(private readonly service: TrendingService) {}

  @Get(':metric')
  getTrending(@Param('metric') metric: string) {
    return this.service.getTrendingTracks(metric);
  }
}
