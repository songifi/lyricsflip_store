// src/entities/listening-session.entity.ts
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

export enum SessionType {
  SINGLE_TRACK = 'single_track',
  ALBUM = 'album',
  PLAYLIST = 'playlist',
  RADIO = 'radio',
  SHUFFLE = 'shuffle',
}

export enum PlaybackSource {
  WEB = 'web',
  MOBILE = 'mobile',
  DESKTOP = 'desktop',
  SMART_SPEAKER = 'smart_speaker',
  CAR = 'car',
}

@Entity('listening_sessions')
@Index(['userId', 'createdAt'])
@Index(['trackId'])
@Index(['createdAt'])
export class ListeningSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column()
  trackId: string;

  @Column({ nullable: true })
  albumId: string;

  @Column({ nullable: true })
  playlistId: string;

  @Column({ nullable: true })
  artistId: string;

  @Column({ nullable: true })
  trackTitle: string;

  @Column({ nullable: true })
  artistName: string;

  @Column({ nullable: true })
  albumTitle: string;

  @Column({ nullable: true })
  genre: string;

  @Column({ default: 0 })
  duration: number; // Track duration in seconds

  @Column({ default: 0 })
  playedDuration: number; // How long user actually listened

  @Column({ default: false })
  isCompleted: boolean; // Played > 80% of track

  @Column({ default: false })
  isSkipped: boolean;

  @Column({
    type: 'enum',
    enum: SessionType,
    default: SessionType.SINGLE_TRACK,
  })
  sessionType: SessionType;

  @Column({
    type: 'enum',
    enum: PlaybackSource,
    default: PlaybackSource.WEB,
  })
  playbackSource: PlaybackSource;

  @Column({ nullable: true })
  deviceInfo: string; // JSON string with device details

  @Column({ nullable: true })
  location: string; // City, Country

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ default: false })
  isOffline: boolean;

  @Column({ nullable: true })
  shuffleMode: boolean;

  @Column({ nullable: true })
  repeatMode: string; // 'off', 'track', 'playlist'

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  volume: number; // 0.00 to 1.00

  @CreateDateColumn()
  createdAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.listeningSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Helper methods
  get completionPercentage(): number {
    return this.duration > 0 ? (this.playedDuration / this.duration) * 100 : 0;
  }

  get isValidListen(): boolean {
    return this.completionPercentage >= 30; // Spotify-like threshold
  }
}