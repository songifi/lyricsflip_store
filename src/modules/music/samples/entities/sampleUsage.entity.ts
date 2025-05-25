import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Sample } from './sample.entity';
import { User } from '../../../users/entities/user.entity';

export enum UsageType {
  PREVIEW = 'preview',
  DOWNLOAD = 'download',
  STREAM = 'stream',
  PURCHASE = 'purchase',
  LICENSE = 'license',
}

export enum UsageContext {
  WEB_PLAYER = 'web_player',
  MOBILE_APP = 'mobile_app',
  API = 'api',
  EMBED = 'embed',
  DIRECT_LINK = 'direct_link',
}

@Entity('sample_usages')
@Index(['sampleId', 'createdAt'])
@Index(['userId', 'type'])
@Index(['type', 'createdAt'])
export class SampleUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: UsageType,
  })
  type: UsageType;

  @Column({
    type: 'enum',
    enum: UsageContext,
    nullable: true,
  })
  context: UsageContext;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'referrer', nullable: true })
  referrer: string;

  @Column('simple-json', { nullable: true })
  metadata: {
    duration?: number; // For streaming/preview
    quality?: string;
    deviceType?: string;
    location?: string;
    [key: string]: any;
  };

  // Relations
  @Column({ name: 'sample_id' })
  sampleId: string;

  @ManyToOne(() => Sample, (sample) => sample.usages, { onDelete: 'CASCADE' })
  sample: Sample;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}