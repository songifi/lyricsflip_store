import { Controller, Post, Get, Body, Request, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SocialFeedService } from './social-feed.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class SocialFeedController {
  constructor(private readonly socialFeedService: SocialFeedService) {}

  @Post('posts')
  async createPost(@Request() req, @Body() dto: CreatePostDto) {
    return this.socialFeedService.createPost(req.user, dto);
  }

  @Get()
  async getFeed(@Request() req, @Query('limit') limit: number, @Query('offset') offset: number) {
    return this.socialFeedService.getFeedForUser(req.user, limit, offset);
  }
}
