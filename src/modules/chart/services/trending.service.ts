@Injectable()
export class TrendingService {
  constructor(@InjectRepository(ChartEntry) private repo: Repository<ChartEntry>) {}

  async getTrendingTracks(metric: string) {
    const date = new Date();
    date.setDate(date.getDate() - 7);

    const recent = await this.repo
      .createQueryBuilder('entry')
      .where('entry.date > :date AND entry.metric = :metric', { date, metric })
      .orderBy('entry.value', 'DESC')
      .limit(10)
      .getMany();

    return recent;
  }
}
