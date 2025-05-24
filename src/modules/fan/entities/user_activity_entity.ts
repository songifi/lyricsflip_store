// src/entities/user-activity.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum ActivityType {
  LIKED_TRACK = 'liked_track',
  SAVED_ALBUM = 'saved_album',
  CREATED_PLAYLIST = 'created_playlist',
  FOLLOWED_USER = 'followed_user',
  FOLLOWED_ARTIST = 'followed_artist',
  SHARED_TRACK = 'shared_track',
  SHARED_PLAYLIST = 'shared_playlist',
  COMMENTED = 'commented',
  RATED_TRACK = 'rated_track',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  LISTENING_MILESTONE = 'listening_milestone',
}

export enum ActivityVisibility {
  PUBLIC = 'public',
  FOLLOWERS = 'followers',
  PRIVATE = 'private',
}

@Entity('user_activities')
@Index(['userId', 'createdAt'])
@Index(['activityType'])
@Index(['visibility'])
@Index(['createdAt'])
export class UserActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  activityType: ActivityType;

  @Column({
    type: 'enum',
    enum: ActivityVisibility,
    default: ActivityVisibility.PUBLIC,
  })
  visibility: ActivityVisibility;

  @Column({ nullable: true })
  targetId: string; // ID of the target item (track, album, user, etc.)

  @Column({ nullable: true })
  targetType: string; // Type of target (track, album, user, etc.)

  @Column({ nullable: true })
  targetTitle: string;

  @Column({ nullable: true })
  targetArtist: string;

  @Column({ nullable: true })
  targetImage: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional activity data

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  commentsCount: number;

  @Column({ default: 0 })
  sharesCount: number;

  @Column({ default: false })
  isPinned: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Helper methods
  getActivityMessage(): string {
    const userName = this.user?.username || 'User';
    
    switch (this.activityType) {
      case ActivityType.LIKED_TRACK:
        return `${userName} liked "${this.targetTitle}" by ${this.targetArtist}`;
      case ActivityType.SAVED_ALBUM:
        return `${userName} saved the album "${this.targetTitle}" by ${this.targetArtist}`;
      case ActivityType.CREATED_PLAYLIST:
        return `${userName} created a new playlist "${this.targetTitle}"`;
      case ActivityType.FOLLOWED_USER:
        return `${userName} started following ${this.targetTitle}`;
      case ActivityType.FOLLOWED_ARTIST:
        return `${userName} started following ${this.targetTitle}`;
      case ActivityType.SHARED_TRACK:
        return `${userName} shared "${this.targetTitle}" by ${this.targetArtist}`;
      case ActivityType.LISTENING_MILESTONE:
        return `${userName} ${this.description}`;
      default:
        return `${userName} performed an activity`;
    }
  }
}