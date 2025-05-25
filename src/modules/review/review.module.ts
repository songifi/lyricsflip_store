import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewHelpfulnessVote } from './entities/review-helpfulness-vote.entity';
import { ArtistResponse } from './entities/artist-response.entity';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { ReviewAnalyticsService } from './review-analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Review, ReviewHelpfulnessVote, ArtistResponse])],
  providers: [ReviewService, ReviewAnalyticsService],
  controllers: [ReviewController],
  exports: [ReviewService, ReviewAnalyticsService],
})
export class ReviewModule {}
