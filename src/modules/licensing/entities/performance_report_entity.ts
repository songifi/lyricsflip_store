// src/licensing/entities/performance-report.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LicensingAgreement } from './licensing-agreement.entity';

export enum ReportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DISPUTED = 'disputed',
}

export enum ReportType {
  STREAMING = 'streaming',
  RADIO = 'radio',
  TV = 'tv',
  LIVE_PERFORMANCE = 'live_performance',
  DIGITAL_DOWNLOAD = 'digital_download',
  SYNC = 'sync',
}

export enum ReportSource {
  SPOTIFY = 'spotify',
  APPLE_MUSIC = 'apple_music',
  YOUTUBE = 'youtube',
  AMAZON_MUSIC = 'amazon_music',
  RADIO_STATION = 'radio_station',
  TV_NETWORK = 'tv_network',
  VENUE = 'venue',
  DISTRIBUTOR = 'distributor',
  MANUAL = 'manual',
}

@Entity('performance_reports')
export class PerformanceReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  reportId: string;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  type: ReportType;

  @Column({
    type: 'enum',
    enum: ReportSource,
  })
  source: ReportSource;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @Column({ type: 'date' })
  reportingPeriodStart: Date;

  @Column({ type: 'date' })
  reportingPeriodEnd: Date;

  @Column({ type: 'varchar', length: 255 })
  musicWorkTitle: string;

  @Column({ type: 'varchar', length: 255 })
  artist: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  isrc: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  iswc: string;

  @Column({ type: 'bigint', default: 0 })
  totalPlays: number;

  @Column({ type: 'bigint', default: 0 })
  totalStreams: number;

  @Column({ type: 'bigint', default: 0 })
  totalDownloads: number;

  @Column({ type: 'integer', default: 0 })
  totalBroadcastMinutes: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  grossRevenue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  netRevenue: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'jsonb' })
  territoryBreakdown: {
    [territory: string]: {
      plays: number;
      streams: number;
      downloads: number;
      revenue: number;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  platformBreakdown: {
    [platform: string]: {
      plays: number;
      streams: number;
      downloads: number;
      revenue: number;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  demographicData: {
    ageGroups?: { [ageGroup: string]: number };
    genderDistribution?: { male: number; female: number; other: number };
    topCities?: { city: string; country: string; plays: number }[];
  };

  @Column({ type: 'jsonb', nullable: true })
  timeAnalytics: {
    hourlyDistribution?: { [hour: string]: number };
    dailyDistribution?: { [day: string]: number };
    monthlyDistribution?: { [month: string]: number };
  };

  @Column({ type: 'varchar', length: 255, nullable: true })
  sourceFileName: string;

  @Column({ type: 'timestamp', nullable: true })
  sourceFileProcessedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  validationErrors: {
    field: string;
    error: string;
    severity: 'warning' | 'error';
  }[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false })
  isReconciled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  reconciledAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reconciledBy: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  expectedRevenue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  variance: number;

  @Column({ type: 'text', nullable: true })
  disputeReason: string;

  @Column({ type: 'timestamp', nullable: true })
  disputeDate: Date;

  @ManyToOne(() => LicensingAgreement, agreement => agreement.performanceReports)
  @JoinColumn({ name: 'agreement_id' })
  agreement: LicensingAgreement;

  @Column({ name: 'agreement_id' })
  agreementId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isCompleted(): boolean {
    return this.status === ReportStatus.COMPLETED;
  }

  hasValidationErrors(): boolean {
    return this.validationErrors && this.validationErrors.length > 0;
  }

  getCriticalErrors(): any[] {
    return this.validationErrors?.filter(error => error.severity === 'error') || [];
  }

  getWarnings(): any[] {
    return this.validationErrors?.filter(error => error.severity === 'warning') || [];
  }

  calculateTotalUsage(): number {
    return this.totalPlays + this.totalStreams + this.totalDownloads;
  }

  getRevenueVariance(): number {
    if (!this.expectedRevenue) return 0;
    return this.netRevenue - this.expectedRevenue;
  }

  getRevenueVariancePercentage(): number {
    if (!this.expectedRevenue || this.expectedRevenue === 0) return 0;
    return (this.getRevenueVariance() / this.expectedRevenue) * 100;
  }

  needsReconciliation(): boolean {
    return !this.isReconciled && this.status === ReportStatus.COMPLETED;
  }

  isDisputed(): boolean {
    return this.status === ReportStatus.DISPUTED;
  }
}