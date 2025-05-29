@Injectable()
export class DataWarehouseService {
  constructor(@InjectRepository(AnalyticsEvent) private repo: Repository<AnalyticsEvent>) {}

  async ingestEvent(dto: CreateEventDto): Promise<AnalyticsEvent> {
    const event = this.repo.create(dto);
    return this.repo.save(event);
  }

  async complexQuery(filter: any): Promise<any[]> {
    // Simulate complex aggregations for warehouse insights
    return this.repo.query(`
      SELECT event_type, COUNT(*) as count
      FROM analytics_event
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY event_type
    `);
  }
}
