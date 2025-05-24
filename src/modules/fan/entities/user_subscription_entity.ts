// src/entities/user-subscription.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  PAYPAL = 'paypal',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  BANK_TRANSFER = 'bank_transfer',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  LIFETIME = 'lifetime',
}

@Entity('user_subscriptions')
@Index(['userId'])
@Index(['status'])
@Index(['expiresAt'])
export class UserSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column()
  planId: string;

  @Column()
  planName: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({
    type: 'enum',
    enum: BillingCycle,
  })
  billingCycle: BillingCycle;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  paypalSubscriptionId: string;

  @Column()
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ nullable: true })
  cancellationReason: string;

  @Column({ default: false })
  autoRenew: boolean;

  @Column({ default: false })
  isTrialUsed: boolean;

  @Column({ nullable: true })
  trialEndsAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  features: Record<string, any>; // Plan features

  @Column({ type: 'jsonb', nullable: true })
  limits: Record<string, any>; // Usage limits

  @Column({ type: 'jsonb', nullable: true })
  usage: Record<string, any>; // Current usage stats

  @Column({ nullable: true })
  discountCode: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercentage: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.subscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Helper methods
  get isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE && 
           (!this.expiresAt || this.expiresAt > new Date());
  }

  get isTrial(): boolean {
    return this.status === SubscriptionStatus.TRIAL &&
           this.trialEndsAt &&
           this.trialEndsAt > new Date();
  }

  get daysUntilExpiry(): number {
    if (!this.expiresAt) return Infinity;
    const now = new Date();
    const diffTime = this.expiresAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isPremium(): boolean {
    return this.isActive && this.planName.toLowerCase().includes('premium');
  }
}