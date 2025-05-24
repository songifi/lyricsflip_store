// src/services/user.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, MusicGenre, SubscriptionTier } from '../entities/user.entity';
import { UserLibrary, LibraryItemType, LibraryAction } from '../entities/user-library.entity';
import { UserFollow, FollowType } from '../entities/user-follow.entity';
import { ListeningSession } from '../entities/listening-session.entity';
import { UserActivity, ActivityType, ActivityVisibility } from '../entities/user-activity.entity';
import { CreateUserDto, UpdateUserDto, UpdateMusicPreferencesDto } from '../dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserLibrary)
    private libraryRepository: Repository<UserLibrary>,
    @InjectRepository(UserFollow)
    private followRepository: Repository<UserFollow>,
    @InjectRepository(ListeningSession)
    private sessionRepository: Repository<ListeningSession>,
    @InjectRepository(UserActivity)
    private activityRepository: Repository<UserActivity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, password, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      ...userData,
    });

    const savedUser = await this.userRepository.save(user);

    // Create welcome activity
    await this.createActivity(savedUser.id, {
      activityType: ActivityType.ACHIEVEMENT_UNLOCKED,
      description: 'Welcome to the music platform!',
      visibility: ActivityVisibility.PRIVATE,
    });

    return savedUser;
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['libraries', 'following', 'followers', 'subscriptions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findUserByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ 
      where: { username },
      relations: ['following', 'followers'],
    });
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findUserById(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findUserByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.findUserByUsername(updateUserDto.username);
      if (existingUser) {
        throw new ConflictException('Username already in use');
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async updateMusicPreferences(id: string, preferences: UpdateMusicPreferencesDto): Promise<User> {
    const user = await this.findUserById(id);
    
    user.favoriteGenres = preferences.favoriteGenres;
    user.favoriteArtists = preferences.favoriteArtists;

    const updatedUser = await this.userRepository.save(user);

    // Create activity for music preferences update
    await this.createActivity(id, {
      activityType: ActivityType.ACHIEVEMENT_UNLOCKED,
      description: 'Updated music preferences',
      metadata: { genres: preferences.favoriteGenres },
    });

    return updatedUser;
  }

  async followUser(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const follower = await this.findUserById(followerId);
    const following = await this.findUserById(followingId);

    if (!following.allowFollowers) {
      throw new BadRequestException('User does not allow followers');
    }

    const existingFollow = await this.followRepository.findOne({
      where: { followerId, followingId, followType: FollowType.USER },
    });

    if (existingFollow) {
      throw new ConflictException('Already following this user');
    }

    const follow = this.followRepository.create({
      followerId,
      followingId,
      followType: FollowType.USER,
      followingName: following.username,
      followingAvatar: following.avatar,
    });

    await this.followRepository.save(follow);

    // Create activity
    await this.createActivity(followerId, {
      activityType: ActivityType.FOLLOWED_USER,
      targetId: followingId,
      targetType: 'user',
      targetTitle: following.username,
      targetImage: following.avatar,
    });
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId, followType: FollowType.USER },
    });

    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    await this.followRepository.remove(follow);
  }

  async followArtist(userId: string, artistId: string, artistName: string, artistAvatar?: string): Promise<void> {
    const existingFollow = await this.followRepository.findOne({
      where: { followerId: userId, followingId: artistId, followType: FollowType.ARTIST },
    });

    if (existingFollow) {
      throw new ConflictException('Already following this artist');
    }

    const follow = this.followRepository.create({
      followerId: userId,
      followingId: artistId,
      followType: FollowType.ARTIST,
      followingName: artistName,
      followingAvatar: artistAvatar,
    });

    await this.followRepository.save(follow);

    // Create activity
    await this.createActivity(userId, {
      activityType: ActivityType.FOLLOWED_ARTIST,
      targetId: artistId,
      targetType: 'artist',
      targetTitle: artistName,
      targetImage: artistAvatar,
    });
  }

  async addToLibrary(userId: string, itemData: {
    itemId: string;
    itemType: LibraryItemType;
    action?: LibraryAction;
    itemTitle?: string;
    itemArtist?: string;
    itemCover?: string;
    itemDuration?: number;
  }): Promise<UserLibrary> {
    const existingItem = await this.libraryRepository.findOne({
      where: { 
        userId, 
        itemId: itemData.itemId, 
        itemType: itemData.itemType,
        action: itemData.action || LibraryAction.SAVED,
      },
    });

    if (existingItem) {
      return existingItem;
    }

    const libraryItem = this.libraryRepository.create({
      userId,
      ...itemData,
      action: itemData.action || LibraryAction.SAVED,
    });

    const savedItem = await this.libraryRepository.save(libraryItem);

    // Create activity based on action
    let activityType: ActivityType;
    switch (itemData.action || LibraryAction.SAVED) {
      case LibraryAction.LIKED:
        activityType = itemData.itemType === LibraryItemType.SONG ? 
          ActivityType.LIKED_TRACK : ActivityType.SAVED_ALBUM;
        break;
      case LibraryAction.SAVED:
        activityType = itemData.itemType === LibraryItemType.ALBUM ? 
          ActivityType.SAVED_ALBUM : ActivityType.LIKED_TRACK;
        break;
      default:
        activityType = ActivityType.LIKED_TRACK;
    }

    await this.createActivity(userId, {
      activityType,
      targetId: itemData.itemId,
      targetType: itemData.itemType,
      targetTitle: itemData.itemTitle,
      targetArtist: itemData.itemArtist,
      targetImage: itemData.itemCover,
    });

    return savedItem;
  }

  async removeFromLibrary(userId: string, itemId: string, itemType: LibraryItemType, action?: LibraryAction): Promise<void> {
    const libraryItem = await this.libraryRepository.findOne({
      where: { 
        userId, 
        itemId, 
        itemType,
        ...(action && { action }),
      },
    });

    if (!libraryItem) {
      throw new NotFoundException('Item not found in library');
    }

    await this.libraryRepository.remove(libraryItem);
  }

  async getUserLibrary(userId: string, itemType?: LibraryItemType): Promise<UserLibrary[]> {
    const query = this.libraryRepository
      .createQueryBuilder('library')
      .where('library.userId = :userId', { userId })
      .orderBy('library.createdAt', 'DESC');

    if (itemType) {
      query.andWhere('library.itemType = :itemType', { itemType });
    }

    return query.getMany();
  }

  async getFollowers(userId: string): Promise<UserFollow[]> {
    return this.followRepository.find({
      where: { followingId: userId, followType: FollowType.USER },
      relations: ['follower'],
      order: { createdAt: 'DESC' },
    });
  }

  async getFollowing(userId: string): Promise<UserFollow[]> {
    return this.followRepository.find({
      where: { followerId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserStats(userId: string): Promise<any> {
    const [totalListens, uniqueTracks, totalMinutes] = await Promise.all([
      this.sessionRepository.count({ where: { userId } }),
      this.sessionRepository
        .createQueryBuilder('session')
        .select('COUNT(DISTINCT session.trackId)', 'count')
        .where('session.userId = :userId', { userId })
        .getRawOne(),
      this.sessionRepository
        .createQueryBuilder('session')
        .select('SUM(session.playedDuration)', 'total')
        .where('session.userId = :userId', { userId })
        .getRawOne(),
    ]);

    const topGenres = await this.sessionRepository
      .createQueryBuilder('session')
      .select('session.genre, COUNT(*) as playCount')
      .where('session.userId = :userId', { userId })
      .andWhere('session.genre IS NOT NULL')
      .groupBy('session.genre')
      .orderBy('playCount', 'DESC')
      .limit(5)
      .getRawMany();

    const topArtists = await this.sessionRepository
      .createQueryBuilder('session')
      .select('session.artistName, COUNT(*) as playCount')
      .where('session.userId = :userId', { userId })
      .andWhere('session.artistName IS NOT NULL')
      .groupBy('session.artistName')
      .orderBy('playCount', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalListens,
      uniqueTracks: parseInt(uniqueTracks.count) || 0,
      totalMinutes: Math.round((parseInt(totalMinutes.total) || 0) / 60),
      topGenres,
      topArtists,
    };
  }

  async getYearEndWrap(userId: string, year: number): Promise<any> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const [totalListens, totalMinutes] = await Promise.all([
      this.sessionRepository.count({
        where: {
          userId,
          createdAt: { $gte: startDate, $lt: endDate } as any,
        },
      }),
      this.sessionRepository
        .createQueryBuilder('session')
        .select('SUM(session.playedDuration)', 'total')
        .where('session.userId = :userId', { userId })
        .andWhere('session.createdAt >= :startDate', { startDate })
        .andWhere('session.createdAt < :endDate', { endDate })
        .getRawOne(),
    ]);

    const topTracks = await this.sessionRepository
      .createQueryBuilder('session')
      .select([
        'session.trackId',
        'session.trackTitle',
        'session.artistName',
        'COUNT(*) as playCount',
      ])
      .where('session.userId = :userId', { userId })
      .andWhere('session.createdAt >= :startDate', { startDate })
      .andWhere('session.createdAt < :endDate', { endDate })
      .andWhere('session.trackTitle IS NOT NULL')
      .groupBy('session.trackId, session.trackTitle, session.artistName')
      .orderBy('playCount', 'DESC')
      .limit(50)
      .getRawMany();

    const topArtists = await this.sessionRepository
      .createQueryBuilder('session')
      .select(['session.artistName', 'COUNT(*) as playCount'])
      .where('session.userId = :userId', { userId })
      .andWhere('session.createdAt >= :startDate', { startDate })
      .andWhere('session.createdAt < :endDate', { endDate })
      .andWhere('session.artistName IS NOT NULL')
      .groupBy('session.artistName')
      .orderBy('playCount', 'DESC')
      .limit(20)
      .getRawMany();

    const topGenres = await this.sessionRepository
      .createQueryBuilder('session')
      .select(['session.genre', 'COUNT(*) as playCount'])
      .where('session.userId = :userId', { userId })
      .andWhere('session.createdAt >= :startDate', { startDate })
      .andWhere('session.createdAt < :endDate', { endDate })
      .andWhere('session.genre IS NOT NULL')
      .groupBy('session.genre')
      .orderBy('playCount', 'DESC')
      .limit(10)
      .getRawMany();

    // Get monthly listening pattern
    const monthlyStats = await this.sessionRepository
      .createQueryBuilder('session')
      .select([
        'EXTRACT(MONTH FROM session.createdAt) as month',
        'COUNT(*) as playCount',
        'SUM(session.playedDuration) as totalMinutes',
      ])
      .where('session.userId = :userId', { userId })
      .andWhere('session.createdAt >= :startDate', { startDate })
      .andWhere('session.createdAt < :endDate', { endDate })
      .groupBy('EXTRACT(MONTH FROM session.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      year,
      totalListens,
      totalMinutes: Math.round((parseInt(totalMinutes.total) || 0) / 60),
      topTracks,
      topArtists,
      topGenres,
      monthlyStats,
      generatedAt: new Date(),
    };
  }

  async createActivity(userId: string, activityData: {
    activityType: ActivityType;
    targetId?: string;
    targetType?: string;
    targetTitle?: string;
    targetArtist?: string;
    targetImage?: string;
    description?: string;
    visibility?: ActivityVisibility;
    metadata?: Record<string, any>;
  }): Promise<UserActivity> {
    const activity = this.activityRepository.create({
      userId,
      visibility: ActivityVisibility.PUBLIC,
      ...activityData,
    });

    return this.activityRepository.save(activity);
  }

  async getUserActivities(userId: string, limit = 20): Promise<UserActivity[]> {
    return this.activityRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getFeedActivities(userId: string, limit = 50): Promise<UserActivity[]> {
    // Get activities from users that the current user follows
    const followingIds = await this.followRepository
      .createQueryBuilder('follow')
      .select('follow.followingId')
      .where('follow.followerId = :userId', { userId })
      .andWhere('follow.followType = :followType', { followType: FollowType.USER })
      .getRawMany();

    const userIds = followingIds.map(f => f.followingId);
    userIds.push(userId); // Include own activities

    return this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.user', 'user')
      .where('activity.userId IN (:...userIds)', { userIds })
      .andWhere('activity.visibility IN (:...visibilities)', { 
        visibilities: [ActivityVisibility.PUBLIC, ActivityVisibility.FOLLOWERS] 
      })
      .orderBy('activity.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async searchUsers(query: string, limit = 20): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.username ILIKE :query', { query: `%${query}%` })
      .orWhere('user.firstName ILIKE :query', { query: `%${query}%` })
      .orWhere('user.lastName ILIKE :query', { query: `%${query}%` })
      .andWhere('user.isActive = true')
      .orderBy('user.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async deactivateUser(id: string): Promise<void> {
    await this.userRepository.update(id, { isActive: false });
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.findUserById(id);
    await this.userRepository.remove(user);
  }
}