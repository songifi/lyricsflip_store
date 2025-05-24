import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../../modules/users/entities/user.entity';
import { Track } from '../../../modules/music/tracks/entities/track.entity';
import { AudioQuality, DownloadStatus } from '../../modules/streaming/enums/audio-quality.enum';

@Entity('download_sessions')
@Index(['userId', 'status'])
@Index(['trackId', 'status'])
export class DownloadSession {
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
    enum: DownloadStatus,
    default: DownloadStatus.PENDING
  })
  status: DownloadStatus;

  @Column({ type: 'bigint', default: 0 })
  fileSize: number;

  @Column({ type: 'bigint', default: 0 })
  downloadedBytes: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'text', nullable: true })
  filePath: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  licenseInfo: any;

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
