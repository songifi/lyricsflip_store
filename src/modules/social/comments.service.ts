import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../../users/entities/user.entity';
import { Post } from '../social-feed/post.entity';
import { Track } from '../tracks/track.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    @InjectRepository(Track)
    private readonly trackRepo: Repository<Track>,
  ) {}

  async createComment(user: User, dto: CreateCommentDto): Promise<Comment> {
    if (!dto.postId && !dto.trackId) {
      throw new BadRequestException('Either postId or trackId must be provided.');
    }

    const comment = this.commentRepo.create({
      author: user,
      content: dto.content,
    });

    if (dto.postId) {
      const post = await this.postRepo.findOne({ where: { id: dto.postId } });
      if (!post) throw new NotFoundException('Post not found');
      comment.post = post;
    }

    if (dto.trackId) {
      const track = await this.trackRepo.findOne({ where: { id: dto.trackId } });
      if (!track) throw new NotFoundException('Track not found');
      comment.track = track;
    }

    return this.commentRepo.save(comment);
  }

  async getCommentsForPost(postId: string): Promise<Comment[]> {
    return this.commentRepo.find({
      where: { post: { id: postId } },
      order: { createdAt: 'ASC' },
      relations: ['author'],
    });
  }

  async getCommentsForTrack(trackId: string): Promise<Comment[]> {
    return this.commentRepo.find({
      where: { track: { id: trackId } },
      order: { createdAt: 'ASC' },
      relations: ['author'],
    });
  }
}
