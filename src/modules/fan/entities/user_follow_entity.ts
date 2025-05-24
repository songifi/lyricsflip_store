// src/entities/user-follow.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

export enum FollowType {
  USER = 'user',
  ARTIST = 'artist',
}

@Entity('user_follows')
@Unique(['followerId', 'followingId', 'followType'])
@Index(['followerId'])
@Index(['followingId'])
@Index(['followType'])
export class UserFollow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  followerId: string;

  @Column()
  followingId: string; // Can be user ID or artist ID

  @Column({
    type: 'enum',
    enum: FollowType,
  })
  followType: FollowType;

  @Column({ nullable: true })
  followingName: string; // Cache the name for quick access

  @Column({ nullable: true })
  followingAvatar: string; // Cache the avatar for quick access

  @Column({ default: true })
  receiveNotifications: boolean;

  @Column({ default: false })
  isMutualFollow: boolean; // For user-to-user follows

  @CreateDateColumn()
  createdAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.following, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followerId' })
  follower: User;

  @ManyToOne(() => User, (user) => user.followers, { 
    onDelete: 'CASCADE',
    nullable: true, // Only for user follows, not artist follows
  })
  @JoinColumn({ name: 'followingId' })
  following: User;
}