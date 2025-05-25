// src/licensing/entities/licensing-agreement.entity.ts
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
import { License } from './license.entity';
import { PerformanceReport } from './performance-report.entity';

export enum AgreementStatus {
  DRAFT = 'draft',
  PENDING_SIGNATURE = 'pending_signature',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended',
}

export enum AgreementType {
  EXCLUSIVE = 'exclusive',
  NON_EXCLUSIVE = 'non_exclusive',
  SOLE = 'sole',
  CO_EXCLUSIVE = 'co_exclusive',
}

@Entity('licensing_agreements')
export class LicensingAgreement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  agreementNumber: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: AgreementType,
  })
  type: AgreementType;

  @Column({
    type: 'enum',
    enum: AgreementStatus,
    default: AgreementStatus.DRAFT,
  })
  status: AgreementStatus;

  @Column({ type: 'varchar', length: 255 })
  licensee: string; // Company/individual receiving the license

  @Column({ type: 'varchar', length: 255 })
  licensor: string; // Rights holder granting the license

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date' })
  expirationDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  signedDate: Date;

  @Column({ type: 'jsonb' })
  terms: {
    royaltyRate: number;
    minimumGuarantee?: number;
    advancePayment?: number;
    recoupmentTerms?: string;
    paymentSchedule: string; // monthly, quarterly, annually
    reportingFrequency: string;
    auditRights?: boolean;
    terminationClauses?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  territorialScope: {
    territories: string[];
    exclusions?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  usageRights: {
    digitalDistribution?: boolean;
    physicalDistribution?: boolean;
    streaming?: boolean;
    broadcasting?: boolean;
    synchronization?: boolean;
    merchandising?: boolean;
    livePerformance?: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  restrictions: {
    genreRestrictions?: string[];
    formatRestrictions?: string[];
    channelRestrictions?: string[];
    purposeRestrictions?: string[];
  };

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAdvancePaid: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRoyaltiesPaid: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  unrecoupedAdvance: number;

  @Column({ type: 'jsonb', nullable: true })
  signatures: {
    licenseeSignature?: {
      name: string;
      title: string;
      date: Date;
      ipAddress?: string;
    };
    licensorSignature?: {
      name: string;
      title: string;
      date: Date;
      ipAddress?: string;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  attachments: {
    id: string;
    filename: string;
    type: string; // contract, amendment, schedule, etc.
    uploadedAt: Date;
  }[];

  @Column({ type: 'boolean', default: true })
  autoRenew: boolean;

  @Column({ type: 'integer', nullable: true })
  renewalTermMonths: number;

  @Column({ type: 'text', nullable: true })
  terminationNotice: string;

  @Column({ type: 'integer', default: 30 })
  terminationNoticeDays: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => License, license => license.agreements)
  @JoinColumn({ name: 'license_id' })
  license: License;

  @Column({ name: 'license_id' })
  licenseId: string;

  @OneToMany(() => PerformanceReport, report => report.agreement)
  performanceReports: PerformanceReport[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isActive(): boolean {
    const now = new Date();
    return (
      this.status === AgreementStatus.ACTIVE &&
      this.effectiveDate <= now &&
      this.expirationDate > now
    );
  }

  isExpired(): boolean {
    return new Date() > this.expirationDate;
  }

  isFullySigned(): boolean {
    return !!(
      this.signatures?.licenseeSignature &&
      this.signatures?.licensorSignature
    );
  }

  calculateRoyalty(grossRevenue: number): number {
    return grossRevenue * this.terms.royaltyRate;
  }

  needsRenewal(daysInAdvance: number = 90): boolean {
    const renewalDate = new Date(this.expirationDate);
    renewalDate.setDate(renewalDate.getDate() - daysInAdvance);
    return new Date() >= renewalDate;
  }

  canTerminate(): boolean {
    return this.isActive() && this.terminationNotice !== null;
  }
}