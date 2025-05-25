@Injectable()
export class ChartService {
  constructor(
    @InjectRepository(ChartEntry) private chartRepo: Repository<ChartEntry>,
    @InjectRepository(ChartHistory) private historyRepo: Repository<ChartHistory>,
  ) {}

  async createChartEntry(dto: CreateChartEntryDto) {
    return this.chartRepo.save(dto);
  }

  async getTopTracks(metric: string, date: Date) {
    return this.chartRepo.find({
      where: { metric, date },
      order: { value: 'DESC' },
      take: 10,
    });
  }

  async addMilestone(entryId: number, milestone: string) {
    return this.historyRepo.save({ chartEntryId: entryId, milestone });
  }

  async getChartHistory(trackId: number) {
    return this.historyRepo.find({
      where: { chartEntry: { trackId } },
      relations: ['chartEntry'],
    });
  }
}
