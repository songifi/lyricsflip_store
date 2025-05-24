// src/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { UserLibrary } from './user-library.entity';
import { ListeningSession } from './listening-session.entity';
import { UserFollow } from './user-follow.entity';
import { UserActivity } from './user-activity.entity';
import { UserSubscription } from './user-subscription.entity';

export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
  FAMILY = 'family',
}

export enum MusicGenre {
  ROCK = 'rock',
  POP = 'pop',
  JAZZ = 'jazz',
  CLASSICAL = 'classical',
  ELECTRONIC = 'electronic',
  HIP_HOP = 'hip_hop',
  COUNTRY = 'country',
  BLUES = 'blues',
  REGGAE = 'reggae',
  FOLK = 'folk',
  METAL = 'metal',
  INDIE = 'indie',
  R_AND_B = 'r_and_b',
  FUNK = 'funk',
  PUNK = 'punk',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({
    type: 'enum',
    enum: SubscriptionTier,
    default: SubscriptionTier.FREE,
  })
  subscriptionTier: SubscriptionTier;

  @Column('simple-array', { nullable: true })
  favoriteGenres: MusicGenre[];

  @Column('simple-array', { nullable: true })
  favoriteArtists: string[];

  @Column({ default: true })
  isPublicProfile: boolean;

  @Column({ default: true })
  allowFollowers: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => UserLibrary, (library) => library.user)
  libraries: UserLibrary[];

  @OneToMany(() => ListeningSession, (session) => session.user)
  listeningSessions: ListeningSession[];

  @OneToMany(() => UserFollow, (follow) => follow.follower)
  following: UserFollow[];

  @OneToMany(() => UserFollow, (follow) => follow.following)
  followers: UserFollow[];

  @OneToMany(() => UserActivity, (activity) => activity.user)
  activities: UserActivity[];

  @OneToMany(() => UserSubscription, (subscription) => subscription.user)
  subscriptions: UserSubscription[];

  // Virtual properties
  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  get followersCount(): number {
    return this.followers?.length || 0;
  }

  get followingCount(): number {
    return this.following?.length || 0;
  }
}