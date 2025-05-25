import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Post } from './entities/post.entity';
import { User } from './entities/user.entity';
import { Comment } from './entities/comment.entity';
import { Message } from './entities/message.entity';
import { FanClub } from './entities/fan-club.entity';
import { ExclusiveContent } from './entities/exclusive-content.entity';
import { Challenge } from './entities/challenge.entity';
import { SocialAnalytics } from './entities/social-analytics.entity';

import { CreatePostDto } from './dtos/create-post.dto';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { CreateMessageDto } from './dtos/create-message.dto';
import { CreateFanClubDto } from './dtos/create-fan-club.dto';
import { CreateExclusiveContentDto } from './dtos/create-exclusive-content.dto';
import { CreateChallengeDto } from './dtos/create-challenge.dto';

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(Post) private postRepo: Repository<Post>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(FanClub) private fanClubRepo: Repository<FanClub>,
    @InjectRepository(ExclusiveContent) private exclusiveContentRepo: Repository<ExclusiveContent>,
    @InjectRepository(Challenge) private challengeRepo: Repository<Challenge>,
    @InjectRepository(SocialAnalytics) private analyticsRepo: Repository<SocialAnalytics>,
  ) {}

  // --- SOCIAL FEED / POSTS ---
  async createPost(userId: string, dto: CreatePostDto): Promise<Post> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const post = this.postRepo.create({ ...dto, author: user });
    const savedPost = await this.postRepo.save(post);

    await this.logAnalytics(user, 'post_created', { postId: savedPost.id });

    return savedPost;
  }

  async getFeed(userId: string): Promise<Post[]> {
    // Simplified: Return latest posts by all users.
    // Extend: Filter by followed artists or friends.
    return this.postRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['author', 'comments', 'comments.author'],
      take: 50,
    });
  }

  // --- COMMENTS ---
  async addComment(userId: string, dto: CreateCommentDto): Promise<Comment> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const post = await this.postRepo.findOne({ where: { id: dto.postId } });
    if (!post) throw new NotFoundException('Post not found');

    const comment = this.commentRepo.create({ author: user, post, content: dto.content });
    const savedComment = await this.commentRepo.save(comment);

    await this.logAnalytics(user, 'comment_added', { postId: post.id, commentId: savedComment.id });

    return savedComment;
  }

  // --- DIRECT MESSAGING ---
  async sendMessage(senderId: string, dto: CreateMessageDto): Promise<Message> {
    const sender = await this.userRepo.findOne({ where: { id: senderId } });
    const receiver = await this.userRepo.findOne({ where: { id: dto.receiverId } });
    if (!sender || !receiver) throw new NotFoundException('Sender or receiver not found');

    const message = this.messageRepo.create({
      sender,
      receiver,
      content: dto.content,
      read: false,
    });

    const savedMessage = await this.messageRepo.save(message);

    await this.logAnalytics(sender, 'message_sent', { receiverId: receiver.id, messageId: savedMessage.id });

    return savedMessage;
  }

  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    return this.messageRepo.find({
      where: [
        { sender: { id: userId1 }, receiver: { id: userId2 } },
        { sender: { id: userId2 }, receiver: { id: userId1 } },
      ],
      order: { sentAt: 'ASC' },
      relations: ['sender', 'receiver'],
    });
  }

  // --- FAN CLUB ---
  async createFanClub(ownerId: string, dto: CreateFanClubDto): Promise<FanClub> {
    const owner = await this.userRepo.findOne({ where: { id: ownerId } });
    if (!owner) throw new NotFoundException('User not found');

    const fanClub = this.fanClubRepo.create({ ...dto, owner });
    return this.fanClubRepo.save(fanClub);
  }

  async addExclusiveContent(ownerId: string, dto: CreateExclusiveContentDto): Promise<ExclusiveContent> {
    const fanClub = await this.fanClubRepo.findOne({ where: { id: dto.fanClubId }, relations: ['owner'] });
    if (!fanClub) throw new NotFoundException('Fan Club not found');

    if (fanClub.owner.id !== ownerId) {
      throw new ForbiddenException('Only the fan club owner can add exclusive content');
    }

    const content = this.exclusiveContentRepo.create({
      title: dto.title,
      contentUrl: dto.contentUrl,
      fanClub,
    });

    return this.exclusiveContentRepo.save(content);
  }

  async getExclusiveContents(fanClubId: string): Promise<ExclusiveContent[]> {
    return this.exclusiveContentRepo.find({ where: { fanClub: { id: fanClubId } } });
  }

  // --- SOCIAL SHARING (stub) ---
  async shareToExternalPlatform(userId: string, platform: string, contentId: string): Promise<void> {
    // Here you would integrate with APIs (Facebook, Twitter, Instagram, etc.)
    // For now, just log the event
    await this.logAnalytics(null, 'content_shared', { userId, platform, contentId });
  }

  // --- COMMUNITY CHALLENGES ---
  async createChallenge(userId: string, dto: CreateChallengeDto): Promise<Challenge> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const challenge = this.challengeRepo.create({
      ...dto,
      createdBy: user,
      isActive: true,
      participantsCount: 0,
    });
    return this.challengeRepo.save(challenge);
  }

  async listActiveChallenges(): Promise<Challenge[]> {
    const now = new Date();
    return this.challengeRepo.find({
      where: {
        isActive: true,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
      order: { startDate: 'DESC' },
      relations: ['createdBy'],
    });
  }

  // --- SOCIAL ANALYTICS ---
  async logAnalytics(user: User | null, eventType: string, metadata: Record<string, any>) {
    const analytic = this.analyticsRepo.create({ user, eventType, metadata });
    await this.analyticsRepo.save(analytic);
  }

  async getAnalyticsSummary(): Promise<any> {
    // Example summary: counts by eventType
    const qb = this.analyticsRepo.createQueryBuilder('analytics');
    const result = await qb
      .select('analytics.eventType', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('analytics.eventType')
      .getRawMany();

    return result;
  }
}
