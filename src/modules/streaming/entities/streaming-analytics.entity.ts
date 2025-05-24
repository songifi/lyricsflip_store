import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../../modules/users/entities/user.entity';
import { Track } from '../../../modules/music/tracks/entities/track.entity';

@Entity('streaming_analytics')
@Index(['userId', 'trackId'], { unique: true })
@Index(['trackId', 'updatedAt'])
export class StreamingAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  trackId: string;

  @Column({ type: 'integer', default: 0 })
  playCount: number;

  @Column({ type: 'integer', default: 0 })
  totalDuration: number; // total seconds listened

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionRate: number; // percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  skipRate: number; // percentage

  @Column({ type: 'integer', default: 0 })
  averageListenTime: number; // in seconds

  @Column({ type: 'timestamp', nullable: true })
  lastPlayedAt: Date;

  @Column({ type: 'integer', default: 0 })
  consecutivePlays: number;

  @Column({ type: 'jsonb', nullable: true })
  qualityPreferences: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Track)
  @JoinColumn({ name: 'trackId' })
  track: Track;
}
