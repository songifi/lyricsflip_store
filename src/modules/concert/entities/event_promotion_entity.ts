// src/entities/event-promotion.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from './event.entity';

export enum PromotionType {
  DISCOUNT = 'discount',
  EARLY_BIRD = 'early_bird',
  GROUP_DISCOUNT = 'group_discount',
  PROMOTIONAL_CODE = 'promotional_code',
  SOCIAL_MEDIA = 'social_media',
  EMAIL_CAMPAIGN = 'email_campaign',
  INFLUENCER = 'influencer',
}

export enum PromotionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  BUY_ONE_GET_ONE = 'bogo',
}

@Entity('event_promotions')
export class EventPromotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PromotionType,
  })
  type: PromotionType;

  @Column({
    type: 'enum',
    enum: PromotionStatus,
    default: PromotionStatus.DRAFT,
  })
  status: PromotionStatus;

  @Column({ type: 'uuid' })
  eventId: string;

  @ManyToOne(() => Event, (event) => event.promotions)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ length: 50, nullable: true, unique: true })
  promoCode: string;

  @Column({
    type: 'enum',
    enum: DiscountType,
    nullable: true,
  })
  discountType: DiscountType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscountAmount: number;

  @Column({ type: 'int', nullable: true })
  usageLimit: number;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'int', nullable: true })
  minQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minOrderAmount: number;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column('simple-array', { nullable: true })
  applicableTiers: string[]; // Ticket tier IDs

  @Column('simple-array', { nullable: true })
  targetAudience: string[];

  @Column('simple-json', { nullable: true })
  campaignData: {
    platform?: string;
    campaignId?: string;
    budget?: number;
    impressions?: number;
    clicks?: number;
    conversions?: number;
    cost?: number;
    roi?: number;
  };

  @Column('simple-json', { nullable: true })
  socialMediaData: {
    platform?: string;
    postUrl?: string;
    hashtags?: string[];
    mentions?: string[];
    shares?: number;
    likes?: number;
    comments?: number;
    reach?: number;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get isExpired(): boolean {
    return new Date() > this.endDate;
  }

  get isUsageLimitReached(): boolean {
    return this.usageLimit !== null && this.usageCount >= this.usageLimit;
  }

  get isValid(): boolean {
    const now = new Date();
    return (
      this.status === PromotionStatus.ACTIVE &&
      now >= this.startDate &&
      now <= this.endDate &&
      !this.isUsageLimitReached
    );
  }
}