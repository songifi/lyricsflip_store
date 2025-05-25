// src/licensing/entities/license.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { RightsHolder } from './rights-holder.entity';
import { LicensingAgreement } from './licensing-agreement.entity';
import { RoyaltyDistribution } from './royalty-distribution.entity';

export enum LicenseType {
  MECHANICAL = 'mechanical',
  PERFORMANCE = 'performance',
  SYNCHRONIZATION = 'synchronization',
  MASTER = 'master',
  PUBLISHING = 'publishing',
}

export enum LicenseStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  PENDING = 'pending',
}

export enum UsageType {
  STREAMING = 'streaming',
  DOWNLOAD = 'download',
  RADIO = 'radio',
  TV = 'tv',
  LIVE_PERFORMANCE = 'live_performance',
  SYNC = 'sync',
}

@Entity('licenses')
export class License {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: LicenseType,
  })
  type: LicenseType;

  @Column({
    type: 'enum',
    enum: LicenseStatus,
    default: LicenseStatus.PENDING,
  })
  status: LicenseStatus;

  @Column({
    type: 'enum',
    enum: UsageType,
    array: true,
  })
  usageTypes: UsageType[];

  @Column({ type: 'varchar', length: 255 })
  musicWorkTitle: string;

  @Column({ type: 'varchar', length: 255 })
  artist: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  isrc: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  iswc: string;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date' })
  expirationDate: Date;

  @Column({ type: 'jsonb' })
  territories: string[]; // Countries/regions where license is valid

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  royaltyRate: number; // Percentage as decimal (e.g., 0.0915 for 9.15%)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fixedFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumGuarantee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  advancePayment: number;

  @Column({ type: 'jsonb', nullable: true })
  usageLimits: {
    maxPlays?: number;
    maxDownloads?: number;
    maxDuration?: number; // in seconds
    exclusivityPeriod?: number; // in days
  };

  @Column({ type: 'jsonb', nullable: true })
  restrictions: {
    geographicRestrictions?: string[];
    timeRestrictions?: string;
    mediumRestrictions?: string[];
    purposeRestrictions?: string[];
  };

  @Column({ type: 'boolean', default: false })
  isExclusive: boolean;

  @Column({ type: 'boolean', default: true })
  isTransferable: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  licenseNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => RightsHolder, rightsHolder => rightsHolder.licenses)
  @JoinColumn({ name: 'rights_holder_id' })
  rightsHolder: RightsHolder;

  @Column({ name: 'rights_holder_id' })
  rightsHolderId: string;

  @OneToMany(() => LicensingAgreement, agreement => agreement.license)
  agreements: LicensingAgreement[];

  @OneToMany(() => RoyaltyDistribution, distribution => distribution.license)
  royaltyDistributions: RoyaltyDistribution[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isActive(): boolean {
    const now = new Date();
    return (
      this.status === LicenseStatus.ACTIVE &&
      this.effectiveDate <= now &&
      this.expirationDate > now
    );
  }

  isExpired(): boolean {
    return new Date() > this.expirationDate;
  }

  isValidInTerritory(territory: string): boolean {
    return this.territories.includes(territory) || this.territories.includes('WORLDWIDE');
  }

  calculateRoyalty(grossRevenue: number): number {
    return grossRevenue * this.royaltyRate;
  }
}