// src/entities/event-analytics.entity.ts
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

export enum AnalyticsType {
  DAILY_SALES = 'daily_sales',
  HOURLY_CHECKIN = 'hourly_checkin',
  DEMOGRAPHIC = 'demographic',
  REVENUE = 'revenue',
  ATTENDANCE = 'attendance',
  MARKETING = 'marketing',
  SOCIAL_MEDIA = 'social_media',
}

@Entity('event_analytics')
export class EventAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  eventId: string;

  @ManyToOne(() => Event, (event) => event.analytics)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({
    type: 'enum',
    enum: AnalyticsType,
  })
  type: AnalyticsType;

  @Column({ type: 'date' })
  recordDate: Date;

  @Column({ type: 'int', nullable: true })
  hour: number; // For hourly analytics

  // Sales Analytics
  @Column({ type: 'int', default: 0 })
  ticketsSold: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  revenue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  fees: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  netRevenue: number;

  // Attendance Analytics
  @Column({ type: 'int', default: 0 })
  checkedInCount: number;

  @Column({ type: 'int', default: 0 })
  noShowCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  attendanceRate: number;

  // Demographics
  @Column('simple-json', { nullable: true })
  ageGroups: {
    '18-24': number;
    '25-34': number;
    '35-44': number;
    '45-54': number;
    '55-64': number;
    '65+': number;
  };

  @Column('simple-json', { nullable: true })
  genderDistribution: {
    male: number;
    female: number;
    other: number;
    notSpecified: number;
  };

  @Column('simple-json', { nullable: true })
  locationData: {
    local: number; // Within 50 miles
    regional: number; // 50-200 miles
    national: number; // 200+ miles
    international: number;
  };

  // Marketing Analytics
  @Column('simple-json', { nullable: true })
  trafficSources: {
    direct: number;
    social: number;
    email: number;
    search: number;
    referral: number;
    paid: number;
  };

  @Column('simple-json', { nullable: true })
  conversionFunnel: {
    views: number;
    clicks: number;
    addToCart: number;
    purchases: number;
    conversionRate: number;
  };

  // Social Media Analytics
  @Column('simple-json', { nullable: true })
  socialMetrics: {
    mentions: number;
    shares: number;
    likes: number;
    comments: number;
    reach: number;
    impressions: number;
    engagement: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  };

  // Financial Analytics
  @Column('simple-json', { nullable: true })
  tierBreakdown: Array<{
    tierId: string;
    tierName: string;
    sold: number;
    revenue: number;
    percentage: number;
  }>;

  @Column('simple-json', { nullable: true })
  refundData: {
    refundRequests: number;
    refundsProcessed: number;
    refundAmount: number;
    refundRate: number;
  };

  // Performance Metrics
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  averageOrderValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  sellThroughRate: number;

  @Column({ type: 'int', nullable: true })
  daysToSellOut: number;

  @Column('simple-json', { nullable: true })
  peakTimes: {
    salesPeak: string; // Time when most sales occurred
    checkinPeak: string; // Time when most check-ins occurred
  };

  // Custom metrics
  @Column('simple-json', { nullable: true })
  customMetrics: Record<string, number>;

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}