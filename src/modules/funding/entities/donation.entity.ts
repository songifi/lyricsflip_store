import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { FundingCampaign } from './funding-campaign.entity';

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: DonationType,
    default: DonationType.TIP,
  })
  type: DonationType;

  @Column({
    type: 'enum',
    enum: DonationStatus,
    default: DonationStatus.PENDING,
  })
  status: DonationStatus;

  @Column('text', { nullable: true })
  message: string;

  @Column({ default: false })
  isAnonymous: boolean;

  @Column({ default: true })
  isPublic: boolean;

  @Column('json', { nullable: true })
  paymentDetails: {
    paymentMethod: string;
    transactionId: string;
    processorFee: number;
    netAmount: number;
  };

  @Column('json', { nullable: true })
  rewardDetails: {
    rewardId: string;
    title: string;
    description: string;
    estimatedDelivery?: string;
  };

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'supporterId' })
  supporter: User;

  @Column('uuid')
  supporterId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'artistId' })
  artist: User;

  @Column('uuid')
  artistId: string;

  @ManyToOne(() => FundingCampaign, (campaign) => campaign.donations, {
    nullable: true,
  })
  @JoinColumn({ name: 'campaignId' })
  campaign?: FundingCampaign;

  @Column('uuid', { nullable: true })
  campaignId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}