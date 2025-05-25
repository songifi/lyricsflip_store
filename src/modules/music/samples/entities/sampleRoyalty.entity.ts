import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Sample } from './sample.entity';
import { User } from '../../../users/entities/user.entity';
import { SampleLicense } from './sample-license.entity';

export enum RoyaltyStatus {
  PENDING = 'pending',
  CALCULATED = 'calculated',
  PAID = 'paid',
  DISPUTED = 'disputed',
}

export enum RoyaltyType {
  SALE = 'sale',
  STREAMING = 'streaming',
  SYNC = 'sync',
  PERFORMANCE = 'performance',
}

@Entity('sample_royalties')
@Index(['creatorId', 'status'])
@Index(['sampleId', 'periodStart', 'periodEnd'])
export class SampleRoyalty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: RoyaltyType,
  })
  type: RoyaltyType;

  @Column({
    type: 'enum',
    enum: RoyaltyStatus,
    default: RoyaltyStatus.PENDING,
  })
  status: RoyaltyStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 5, scale: 2 })
  rate: number; // Percentage rate applied

  @Column('decimal', { precision: 10, scale: 2 })
  grossRevenue: number;

  @Column({ name: 'usage_count' })
  usageCount: number;

  @Column({ name: 'period_start' })
  periodStart: Date;

  @Column({ name: 'period_end' })
  periodEnd: Date;

  @Column({ name: 'calculated_at', nullable: true })
  calculatedAt: Date;

  @Column({ name: 'paid_at', nullable: true })
  paidAt: Date;

  @Column('simple-json', { nullable: true })
  metadata: {
    paymentMethod?: string;
    transactionId?: string;
    currency?: string;
    exchangeRate?: number;
    [key: string]: any;
  };

  // Relations
  @Column({ name: 'sample_id' })
  sampleId: string;

  @ManyToOne(() => Sample, { onDelete: 'CASCADE' })
  sample: Sample;

  @Column({ name: 'creator_id' })
  creatorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  creator: User;

  @Column({ name: 'license_id', nullable: true })
  licenseId: string;

  @ManyToOne(() => SampleLicense, { nullable: true, onDelete: 'SET NULL' })
  license: SampleLicense;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}