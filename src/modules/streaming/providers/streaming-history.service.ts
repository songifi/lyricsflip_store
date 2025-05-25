import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { StreamingHistory } from '../../../database/entities/streaming-history.entity';
import { AudioQuality } from '../enums/audio-quality.enum';

@Injectable()
export class StreamingHistoryService {
  constructor(
    private historyRepository: Repository<StreamingHistory>,
    @InjectRepository(StreamingHistory)
  ) {}

  async addToHistory(
    userId: string,
    trackId: string,
    listenDuration: number,
    completionPercentage: number,
    quality: AudioQuality,
    context?: string,
    contextId?: string,
    request?: any
  ): Promise<StreamingHistory> {
    const historyEntry = this.historyRepository.create({
      userId,
      trackId,
      listenDuration,
      completionPercentage,
      quality,
      context,
      contextId,
      skipped: completionPercentage < 30, // Consider skipped if less than 30% played
      ipAddress: request?.ip || '0.0.0.0',
      userAgent: request?.headers?.['user-agent'] || 'Unknown'
    });

    return this.historyRepository.save(historyEntry);
  }

  async getUserHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<StreamingHistory[]> {
    return this.historyRepository.find({
      where: { userId },
      relations: ['track', 'track.artist', 'track.album'],
      order: { playedAt: 'DESC' },
      take: limit,
      skip: offset
    });
  }

  async getRecentlyPlayed(
    userId: string,
    limit: number = 20
  ): Promise<StreamingHistory[]> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    return this.historyRepository.find({
      where: {
        userId,
        playedAt: Between(oneDayAgo, new Date())
      },
      relations: ['track', 'track.artist'],
      order: { playedAt: 'DESC' },
      take: limit
    });
  }

  async getMostPlayedTracks(
    userId: string,
    timeframe: 'week' | 'month' | 'year' = 'month',
    limit: number = 10
  ): Promise<any[]> {
    const startDate = new Date();
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const result = await this.historyRepository
      .createQueryBuilder('history')
      .select('history.trackId', 'trackId')
      .addSelect('COUNT(*)', 'playCount')
      .addSelect('SUM(history.listenDuration)', 'totalDuration')
      .addSelect('AVG(history.completionPercentage)', 'avgCompletion')
      .leftJoin('history.track', 'track')
      .addSelect('track.title', 'title')
      .addSelect('track.artist', 'artist')
      .where('history.userId = :userId', { userId })
      .andWhere('history.playedAt >= :startDate', { startDate })
      .groupBy('history.trackId')
      .addGroupBy('track.title')
      .addGroupBy('track.artist')
      .orderBy('playCount', 'DESC')
      .limit(limit)
      .getRawMany();

    return result;
  }

  async getListeningStats(userId: string, timeframe: 'week' | 'month' | 'year' = 'month') {
    const startDate = new Date();
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const stats = await this.historyRepository
      .createQueryBuilder('history')
      .select('COUNT(*)', 'totalPlays')
      .addSelect('SUM(history.listenDuration)', 'totalDuration')
      .addSelect('AVG(history.completionPercentage)', 'avgCompletion')
      .addSelect('COUNT(DISTINCT history.trackId)', 'uniqueTracks')
      .where('history.userId = :userId', { userId })
      .andWhere('history.playedAt >= :startDate', { startDate })
      .getRawOne();

    const qualityStats = await this.historyRepository
      .createQueryBuilder('history')
      .select('history.quality', 'quality')
      .addSelect('COUNT(*)', 'count')
      .where('history.userId = :userId', { userId })
      .andWhere('history.playedAt >= :startDate', { startDate })
      .groupBy('history.quality')
      .getRawMany();

    return {
      ...stats,
      qualityDistribution: qualityStats.reduce((acc, item) => {
        acc[item.quality] = parseInt(item.count);
        return acc;
      }, {})
    };
  }

  async clearUserHistory(userId: string, olderThan?: Date): Promise<void> {
    const queryBuilder = this.historyRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId });

    if (olderThan) {
      queryBuilder.andWhere('playedAt < :olderThan', { olderThan });
    }

    await queryBuilder.execute();
  }
}
