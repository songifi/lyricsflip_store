import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async createComment(@Request() req, @Body() dto: CreateCommentDto) {
    return this.commentsService.createComment(req.user, dto);
  }

  @Get('post/:postId')
  async getPostComments(@Param('postId') postId: string) {
    return this.commentsService.getCommentsForPost(postId);
  }

  @Get('track/:trackId')
  async getTrackComments(@Param('trackId') trackId: string) {
    return this.commentsService.getCommentsForTrack(trackId);
  }
}
