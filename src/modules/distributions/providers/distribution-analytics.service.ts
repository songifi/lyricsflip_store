import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DistributionAnalytics } from '../entities/distribution-analytics.entity';
import { DistributionRelease, ReleaseStatus } from '../entities/distribution-release.entity';

@Injectable()
export class DistributionAnalyticsService {
  private readonly logger = new Logger(DistributionAnalyticsService.name);

  constructor(
    private readonly analyticsRepository: Repository<DistributionAnalytics>,
    private readonly releaseRepository: Repository<DistributionRelease>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async collectDailyAnalytics(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const liveReleases = await this.releaseRepository.find({
      where: { status: ReleaseStatus.LIVE },
      relations: ['partner'],
    });

    for (const release of liveReleases) {
      try {
        const analytics = await this.fetchPlatformAnalytics(
          release.id,
          release.partner.platform,
          yesterday,
        );

        await this.saveAnalytics(analytics);
        this.logger.log(`Analytics collected for release ${release.id} on ${release.partner.platform}`);
      } catch (error) {
        this.logger.error(`Failed to collect analytics for release ${release.id}:`, error);
      }
    }
  }

  private async fetchPlatformAnalytics(
    releaseId: string,
    platform: string,
    date: Date,
  ): Promise<Partial<DistributionAnalytics>> {
    // Implement platform-specific analytics fetching
    switch (platform) {
      case 'spotify':
        return this.fetchSpotifyAnalytics(releaseId, date);
      case 'apple_music':
        return this.fetchAppleMusicAnalytics(releaseId, date);
      default:
        return this.getMockAnalytics(releaseId, platform, date);
    }
  }

  private async fetchSpotifyAnalytics(releaseId: string, date: Date): Promise<Partial<DistributionAnalytics>> {
    // Implement Spotify Analytics API integration
    return this.getMockAnalytics(releaseId, 'spotify', date);
  }

  private async fetchAppleMusicAnalytics(releaseId: string, date: Date): Promise<Partial<DistributionAnalytics>> {
    // Implement Apple Music Analytics API integration
    return this.getMockAnalytics(releaseId, 'apple_music', date);
  }

  private getMockAnalytics(releaseId: string, platform: string, date: Date): Partial<DistributionAnalytics> {
    return {
      releaseId,
      platform,
      date,
      streams: Math.floor(Math.random() * 1000),
      downloads: Math.floor(Math.random() * 100),
      revenue: Math.random() * 50,
      likes: Math.floor(Math.random() * 200),
      shares: Math.floor(Math.random() * 50),
      comments: Math.floor(Math.random() * 25),
      demographicData: {
        ageGroups: {
          '18-24': 30,
          '25-34': 40,
          '35-44': 20,
          '45+': 10,
        },
        gender: {
          male: 55,
          female: 45,
        },
      },
      geographicData: {
        countries: {
          US: 40,
          UK: 15,
          CA: 10,
          AU: 8,
          DE: 7,
          other: 20,
        },
      },
    };
  }

  private async saveAnalytics(analyticsData: Partial<DistributionAnalytics>): Promise<DistributionAnalytics> {
    const existingAnalytics = await this.analyticsRepository.findOne({
      where: {
        releaseId: analyticsData.releaseId,
        platform: analyticsData.platform,
        date: analyticsData.date,
      },
    });

    if (existingAnalytics) {
      Object.assign(existingAnalytics, analyticsData);
      return this.analyticsRepository.save(existingAnalytics);
    }

    const analytics = this.analyticsRepository.create(analyticsData);
    return this.analyticsRepository.save(analytics);
  }

  async getAnalytics(
    releaseId: string,
    platform?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<DistributionAnalytics[]> {
    const whereCondition: any = { releaseId };

    if (platform) {
      whereCondition.platform = platform;
    }

    if (startDate && endDate) {
      whereCondition.date = Between(startDate, endDate);
    }

    return this.analyticsRepository.find({
      where: whereCondition,
      order: { date: 'DESC' },
    });
  }

  async getAggregatedAnalytics(
    releaseId: string,
    platform?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Record<string, any>> {
    const analytics = await this.getAnalytics(releaseId, platform, startDate, endDate);

    const aggregated = {
      totalStreams: 0,
      totalDownloads: 0,
      totalRevenue: 0,
      totalLikes: 0,
      totalShares: 0,
      totalComments: 0,
      averageDaily: {
        streams: 0,
        downloads: 0,
        revenue: 0,
      },
      platformBreakdown: {} as Record<string, any>,
    };

    analytics.forEach(entry => {
      aggregated.totalStreams += Number(entry.streams);
      aggregated.totalDownloads += Number(entry.downloads);
      aggregated.totalRevenue += Number(entry.revenue);
      aggregated.totalLikes += Number(entry.likes);
      aggregated.totalShares += Number(entry.shares);
      aggregated.totalComments += Number(entry.comments);

      if (!aggregated.platformBreakdown[entry.platform]) {
        aggregated.platformBreakdown[entry.platform] = {
          streams: 0,
          downloads: 0,
          revenue: 0,
        };
      }

      aggregated.platformBreakdown[entry.platform].streams += Number(entry.streams);
      aggregated.platformBreakdown[entry.platform].downloads += Number(entry.downloads);
      aggregated.platformBreakdown[entry.platform].revenue += Number(entry.revenue);
    });

    const days = analytics.length || 1;
    aggregated.averageDaily.streams = aggregated.totalStreams / days;
    aggregated.averageDaily.downloads = aggregated.totalDownloads / days;
    aggregated.averageDaily.revenue = aggregated.totalRevenue / days;

    return aggregated;
  }

  async getTopPerformingReleases(
    artistId?: string,
    platform?: string,
    metric: 'streams' | 'revenue' | 'downloads' = 'streams',
    limit: number = 10,
  ): Promise<any[]> {
    const queryBuilder = this.analyticsRepository
      .createQueryBuilder('analytics')
      .leftJoinAndSelect('analytics.releaseId', 'release')
      .select([
        'analytics.releaseId',
        'analytics.platform',
        `SUM(analytics.${metric}) as total${metric.charAt(0).toUpperCase() + metric.slice(1)}`,
      ])
      .groupBy('analytics.releaseId, analytics.platform');

    if (artistId) {
      queryBuilder.andWhere('release.artistId = :artistId', { artistId });
    }

    if (platform) {
      queryBuilder.andWhere('analytics.platform = :platform', { platform });
    }

    return queryBuilder
      .orderBy(`total${metric.charAt(0).toUpperCase() + metric.slice(1)}`, 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
