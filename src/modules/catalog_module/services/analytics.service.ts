@Injectable()
export class AnalyticsService {
  async getGenreDistribution(): Promise<any> {
    return await this.catalogRepo
      .createQueryBuilder('catalog')
      .select('catalog.genre', 'genre')
      .addSelect('COUNT(*)', 'count')
      .groupBy('catalog.genre')
      .getRawMany();
  }
}
