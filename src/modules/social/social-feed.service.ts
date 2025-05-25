import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityType } from './entities/activity.entity';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class SocialFeedService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,

    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  async createPost(user: User, createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postRepo.create({
      author: user,
      content: createPostDto.content,
    });

    const savedPost = await this.postRepo.save(post);

    // Create activity record
    const activity = this.activityRepo.create({
      user,
      type: ActivityType.POST_CREATED,
      payload: { postId: savedPost.id, content: savedPost.content },
    });
    await this.activityRepo.save(activity);

    return savedPost;
  }

  async getFeedForUser(user: User, limit = 20, offset = 0): Promise<Activity[]> {
    // For simplicity: return recent activities from users this user follows + their own
    // Assume user.following is an array of Users followed

    const followedUserIds = user.following?.map(u => u.id) || [];

    return this.activityRepo.find({
      where: [
        { user: { id: user.id } },
        { user: { id: In(followedUserIds) } },
      ],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['user'],
    });
  }
}
