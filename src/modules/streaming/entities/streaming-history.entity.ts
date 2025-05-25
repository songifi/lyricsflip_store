import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from '../../../modules/users/entities/user.entity';
import { Track } from '../../../modules/music/tracks/entities/track.entity';
import { AudioQuality } from '../../modules/streaming/enums/audio-quality.enum';

@Entity('streaming_history')
@Index(['userId', 'playedAt'])
@Index(['trackId', 'playedAt'])
export class StreamingHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  trackId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  playedAt: Date;

  @Column({
    type: 'enum',
    enum: AudioQuality,
    default: AudioQuality.HIGH
  })
  quality: AudioQuality;

  @Column({ type: 'integer', default: 0 })
  listenDuration: number; // in seconds

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercentage: number;

  @Column({ type: 'boolean', default: false })
  skipped: boolean;

  @Column({ type: 'text', nullable: true })
  context: string; // playlist, album, radio, etc.

  @Column('uuid', { nullable: true })
  contextId: string; // playlist id, album id, etc.

  @Column({ length: 45 })
  ipAddress: string;

  @Column({ type: 'text' })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Track)
  @JoinColumn({ name: 'trackId' })
  track: Track;
}
