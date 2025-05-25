import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewContentType } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { User } from '../user/entities/user.entity';
import { ReviewHelpfulnessVote } from './entities/review-helpfulness-vote.entity';
import { ArtistResponse } from './entities/artist-response.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(ReviewHelpfulnessVote) private voteRepo: Repository<ReviewHelpfulnessVote>,
    @InjectRepository(ArtistResponse) private responseRepo: Repository<ArtistResponse>,
  ) {}

  async createReview(user: User, dto: CreateReviewDto, verified: boolean): Promise<Review> {
    const review = this.reviewRepo.create({
      ...dto,
      user,
      verifiedPurchase: verified,
      moderationStatus: 'pending',
    });
    return this.reviewRepo.save(review);
  }

  async approveReview(reviewId: number): Promise<Review> {
    const review = await this.reviewRepo.findOneBy({ id: reviewId });
    if (!review) throw new NotFoundException('Review not found');
    review.moderationStatus = 'approved';
    return this.reviewRepo.save(review);
  }

  async rejectReview(reviewId: number): Promise<Review> {
    const review = await this.reviewRepo.findOneBy({ id: reviewId });
    if (!review) throw new NotFoundException('Review not found');
    review.moderationStatus = 'rejected';
    return this.reviewRepo.save(review);
  }

  async voteHelpfulness(user: User, reviewId: number, isHelpful: boolean): Promise<ReviewHelpfulnessVote> {
    const review = await this.reviewRepo.findOneBy({ id: reviewId, moderationStatus: 'approved' });
    if (!review) throw new NotFoundException('Review not found or not approved');
    const existingVote = await this.voteRepo.findOne({
      where: { review: { id: reviewId }, user: { id: user.id } },
      relations: ['review', 'user'],
    });
    if (existingVote) {
      existingVote.isHelpful = isHelpful;
      return this.voteRepo.save(existingVote);
    }
    const vote = this.voteRepo.create({ review, user, isHelpful });
    return this.voteRepo.save(vote);
  }

  async addArtistResponse(artist: User, reviewId: number, responseText: string): Promise<ArtistResponse> {
    const review = await this.reviewRepo.findOneBy({ id: reviewId, moderationStatus: 'approved' });
    if (!review) throw new NotFoundException('Review not found or not approved');
    // TODO: Add authorization check if artist owns content
    const response = this.responseRepo.create({ review, artist, responseText });
    return this.responseRepo.save(response);
  }

  async getReviewsForContent(contentId: number, contentType: ReviewContentType): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { contentId, contentType, moderationStatus: 'approved' },
      relations: ['user', 'helpfulnessVotes', 'artistResponses'],
      order: { createdAt: 'DESC' },
    });
  }
}
