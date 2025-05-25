import { Controller, Post, Body, UseGuards, Req, Param, Patch, Get } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Request } from 'express';
import { VoteHelpfulnessDto } from './dto/vote-helpfulness.dto';
import { ArtistResponseDto } from './dto/artist-response.dto';

// Note: Add real guards like AuthGuard, RolesGuard for production.

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async createReview(@Req() req: Request, @Body() dto: CreateReviewDto) {
    const user = req.user as any; // Assume user injected by auth middleware
    // TODO: Implement verification logic (purchase/attendance)
    const verified = true; // Stub for demo
    return this.reviewService.createReview(user, dto, verified);
  }

  @Patch(':id/approve')
  async approveReview(@Param('id') id: number) {
    return this.reviewService.approveReview(id);
  }

  @Patch(':id/reject')
  async rejectReview(@Param('id') id: number) {
    return this.reviewService.rejectReview(id);
  }

  @Post(':id/vote')
  async voteHelpfulness(@Req() req: Request, @Param('id') id: number, @Body() dto: VoteHelpfulnessDto) {
    const user = req.user as any;
    return this.reviewService.voteHelpfulness(user, id, dto.isHelpful);
  }

  @Post(':id/response')
  async addArtistResponse(@Req() req: Request, @Param('id') id: number, @Body() dto: ArtistResponseDto) {
    const artist = req.user as any;
    return this.reviewService.addArtistResponse(artist, id, dto.responseText);
  }

  @Get('content/:contentType/:contentId')
  async getReviews(
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: number,
  ) {
    return this.reviewService.getReviewsForContent(contentId, contentType as any);
  }
}
