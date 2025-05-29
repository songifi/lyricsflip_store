@Injectable()
export class MarketResearchService {
  constructor(@InjectRepository(MarketReport) private repo: Repository<MarketReport>) {}

  async createReport(data: CreateMarketReportDto): Promise<MarketReport> {
    const report = this.repo.create(data);
    return this.repo.save(report);
  }

  async getReports(): Promise<MarketReport[]> {
    return this.repo.find();
  }
}
