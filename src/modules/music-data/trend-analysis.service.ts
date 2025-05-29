@Injectable()
export class TrendAnalysisService {
  constructor(@InjectRepository(AnalyticsEvent) private repo: Repository<AnalyticsEvent>) {}

  async identifyTrends(): Promise<any> {
    const data = await this.repo.query(`
      SELECT event_type, date_trunc('day', created_at) as day, COUNT(*) as volume
      FROM analytics_event
      GROUP BY event_type, day
      ORDER BY day
    `);
    // Further processing with moving average or smoothing
    return data;
  }
}
