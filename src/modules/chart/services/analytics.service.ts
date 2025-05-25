@Injectable()
export class AnalyticsService {
  constructor(@InjectRepository(ChartEntry) private repo: Repository<ChartEntry>) {}

  async getGeoAnalytics(metric: string, date: Date) {
    return this.repo.query(`
      SELECT location, SUM(value) as total
      FROM chart_entries
      WHERE metric = $1 AND date = $2
      GROUP BY location
    `, [metric, date]);
  }

  async getDemographics(metric: string, date: Date) {
    return this.repo.query(`
      SELECT age_group, gender, SUM(value) as total
      FROM user_engagements
      WHERE metric = $1 AND date = $2
      GROUP BY age_group, gender
    `, [metric, date]);
  }
}
