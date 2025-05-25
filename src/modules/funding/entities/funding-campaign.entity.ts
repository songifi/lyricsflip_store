import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Album } from './album.entity';
import { Donation } from './donation.entity';

@Entity('funding_campaigns')
export class FundingCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: CampaignType,
    default: CampaignType.GENERAL_SUPPORT,
  })
  type: CampaignType;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  goalAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  currentAmount: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column('simple-array', { nullable: true })
  videos: string[];

  @Column('json', { nullable: true })
  rewards: {
    amount: number;
    title: string;
    description: string;
    estimatedDelivery?: string;
    limitedQuantity?: number;
    claimedQuantity?: number;
  }[];

  @Column('json', { nullable: true })
  milestones: {
    amount: number;
    title: string;
    description: string;
    achieved: boolean;
    achievedAt?: Date;
  }[];

  @Column({ default: true })
  allowTips: boolean;

  @Column({ default: true })
  isPublic: boolean;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'artistId' })
  artist: User;

  @Column('uuid')
  artistId: string;

  @ManyToOne(() => Album, { nullable: true })
  @JoinColumn({ name: 'albumId' })
  album?: Album;

  @Column('uuid', { nullable: true })
  albumId?: string;

  @OneToMany(() => Donation, (donation) => donation.campaign)
  donations: Donation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}