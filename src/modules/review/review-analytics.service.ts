import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewAnalyticsService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
  ) {}

  async getAverageRating(contentId: number, contentType: string): Promise<number> {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.starRating)', 'avg')
      .where('review.contentId = :contentId', { contentId })
      .andWhere('review.contentType = :contentType', { contentType })
      .andWhere('review.moderationStatus = :status', { status: 'approved' })
      .getRawOne();

    return parseFloat(result.avg) || 0;
  }

  async getReviewCount(contentId: number, contentType: string): Promise<number> {
    return this.reviewRepo.count({
      where: {
        contentId,
        contentType,
        moderationStatus: 'approved',
      },
    });
  }

  // Add more analytics methods as needed
}
