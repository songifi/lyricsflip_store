import { Controller, Post as HttpPost, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { SocialService } from './social.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { CreateMessageDto } from './dtos/create-message.dto';
import { CreateFanClubDto } from './dtos/create-fan-club.dto';
import { CreateExclusiveContentDto } from './dtos/create-exclusive-content.dto';
import { CreateChallengeDto } from './dtos/create-challenge.dto';

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // --- POSTS & FEED ---
  @HttpPost('posts')
  async createPost(@Req() req, @Body() dto: CreatePostDto) {
    return this.socialService.createPost(req.user.id, dto);
  }

  @Get('feed')
  async getFeed(@Req() req) {
    return this.socialService.getFeed(req.user.id);
  }

  // --- COMMENTS ---
  @HttpPost('comments')
  async addComment(@Req() req, @Body() dto: CreateCommentDto) {
    return this.socialService.addComment(req.user.id, dto);
  }

  // --- MESSAGING ---
  @HttpPost('messages')
  async sendMessage(@Req() req, @Body() dto: CreateMessageDto) {
    return this.socialService.sendMessage(req.user.id, dto);
  }

  @Get('messages/:userId')
  async getMessages(@Req() req, @Param('userId') otherUserId: string) {
    return this.socialService.getMessagesBetweenUsers(req.user.id, otherUserId);
  }

  // --- FAN CLUB ---
  @HttpPost('fan-clubs')
  async createFanClub(@Req() req, @Body() dto: CreateFanClubDto) {
    return this.socialService.createFanClub(req.user.id, dto);
  }

  @HttpPost('fan-clubs/exclusive-content')
  async addExclusiveContent(@Req() req, @Body() dto: CreateExclusiveContentDto) {
    return this.socialService.addExclusiveContent(req.user.id, dto);
  }

  @Get('fan-clubs/:fanClub
