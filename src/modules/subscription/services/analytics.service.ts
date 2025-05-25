@Injectable()
export class AnalyticsService {
  constructor(@InjectRepository(Subscription) private repo: Repository<Subscription>) {}

  async getChurnRate(): Promise<number> {
    const total = await this.repo.count();
    const expired = await this.repo.count({ where: { endDate: LessThan(new Date()) } });
    return (expired / total) * 100;
  }

  async activeSubscribers(): Promise<number> {
    return this.repo.count({ where: { endDate: MoreThan(new Date()) } });
  }
}
