import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SharedContent, SharedContentType } from './entities/shared-content.entity';
import { User } from '../../users/entities/user.entity';
import { ShareContentDto } from './dto/share-content.dto';
import { Post } from '../social-feed/post.entity';
import { Track } from '../tracks/track.entity';

@Injectable()
export class SharingService {
  constructor(
    @InjectRepository(SharedContent)
    private readonly sharedContentRepo: Repository<SharedContent>,

    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    @InjectRepository(Track)
    private readonly trackRepo: Repository<Track>,
  ) {}

  async shareContent(user: User, dto: ShareContentDto): Promise<SharedContent> {
    const shared = this.sharedContentRepo.create({ sharer: user, type: dto.type });

    switch (dto.type) {
      case SharedContentType.URL:
        if (!dto.url) throw new BadRequestException('URL must be provided for URL sharing');
        shared.url = dto.url;
        break;

      case SharedContentType.POST:
        if (!dto.postId) throw new BadRequestException('postId must be provided for post sharing');
        const post = await this.postRepo.findOne({ where: { id: dto.postId } });
        if (!post) throw new NotFoundException('Post not found');
        shared.post = post;
        break;

      case SharedContentType.TRACK:
        if (!dto.trackId) throw new BadRequestException('trackId must be provided for track sharing');
        const track = await this.trackRepo.findOne({ where: { id: dto.trackId } });
        if (!track) throw new NotFoundException('Track not found');
        shared.track = track;
        break;
    }

    return this.sharedContentRepo.save(shared);
  }
}
