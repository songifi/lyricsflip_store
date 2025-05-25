import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BandMember } from './band-member.entity';
import { Band } from './band.entity';

export enum RevenueType {
  STREAMING = 'streaming',
  MERCHANDISE = 'merchandise',
  LIVE_PERFORMANCE = 'live_performance',
  LICENSING = 'licensing',
  SPONSORSHIP = 'sponsorship',
  OTHER = 'other',
}

export enum ShareStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

@Entity('revenue_shares')
export class RevenueShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ uuid: true })
  bandId: string;

  @Column({ uuid: true })
  memberId: string;

  @Column({
    type: 'enum',
    enum: RevenueType,
  })
  revenueType: RevenueType;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentage: number;

  @Column({
    type: 'enum',
    enum: ShareStatus,
    default: ShareStatus.ACTIVE,
  })
  status: ShareStatus;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  conditions: {
    minimumAmount?: number;
    maximumAmount?: number;
    specificAlbums?: string[];
    specificTracks?: string[];
  };

  @ManyToOne(() => Band, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bandId' })
  band: Band;

  @ManyToOne(() => BandMember, (member) => member.revenueShares, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'memberId' })
  member: BandMember;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}