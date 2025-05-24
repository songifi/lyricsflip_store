import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../../modules/users/entities/user.entity';
import { Track } from '../../../modules/music/tracks/entities/track.entity';
import { AudioQuality, StreamingStatus } from '../../modules/streaming/enums/audio-quality.enum';

@Entity('streaming_sessions')
@Index(['userId', 'createdAt'])
@Index(['trackId', 'createdAt'])
export class StreamingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  trackId: string;

  @Column({
    type: 'enum',
    enum: AudioQuality,
    default: AudioQuality.HIGH
  })
  quality: AudioQuality;

  @Column({
    type: 'enum',
    enum: StreamingStatus,
    default: StreamingStatus.PLAYING
  })
  status: StreamingStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'integer', default: 0 })
  duration: number; // in seconds

  @Column({ type: 'bigint', default: 0 })
  bytesStreamed: number;

  @Column({ length: 45 })
  ipAddress: string;

  @Column({ type: 'text' })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  location: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

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
