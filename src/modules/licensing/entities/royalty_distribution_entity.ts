// src/licensing/entities/royalty-distribution.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { License } from './license.entity';
import { RightsHolder } from './rights-holder.entity';

export enum DistributionStatus {
  PENDING = 'pending',
  CALCULATED = 'calculated',
  APPROVED = 'approved',
  PAID = 'paid',
  FAILED = 'failed',
  DISPUTED = 'disputed',
}

export enum RoyaltyType {
  MECHANICAL = 'mechanical',
  PERFORMANCE = 'performance',
  SYNCHRONIZATION = 'synchronization',
  DIGITAL = 'digital',
  STREAMING = 'streaming',
  NEIGHBORING_RIGHTS = 'neighboring_rights',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  WIRE_TRANSFER = 'wire_transfer',
  ACH = 'ach',
  PAYPAL = 'paypal',
  CHECK = 'check',
}

@Entity('royalty_distributions')
export class RoyaltyDistribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  distributionId: string; // Unique identifier for tracking

  @Column({
    type: 'enum',
    enum: RoyaltyType,
  })
  royaltyType: RoyaltyType;

  @Column({
    type: 'enum',
    enum: DistributionStatus,
    default: DistributionStatus.PENDING,
  })
  status: DistributionStatus;

  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  grossRevenue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  netRevenue: number;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  royaltyRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  royaltyAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  ownershipShare: number; // Rights holder's share percentage

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  distributionAmount: number; // Final amount to be paid

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  deductions: number; // Administrative fees, taxes, etc.

  @Column({ type: 'jsonb', nullable: true })
  deductionDetails: {
    adminFee?: number;
    processingFee?: number;
    taxes?: number;
    otherDeductions?: { description: string; amount: number }[];
  };

  @Column({ type: 'varchar', length: 3 })
  currency: string; // ISO currency code

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 1.0 })
  exchangeRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  usdEquivalent: number;

  @Column({ type: 'jsonb' })
  usageData: {
    totalPlays?: number;
    totalDownloads?: number;
    totalStreams?: number;
    broadcastMinutes?: number;
    territories?: { [territory: string]: number };
    platforms?: { [platform: string]: number };
  };

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentReference: string;

  @Column({ type: 'timestamp', nullable: true })
  calculatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  approvedBy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  processedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  disputeReason: string;

  @Column({ type: 'timestamp', nullable: true })
  disputeDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  paymentDetails: {
    transactionId?: string;
    bankReference?: string;
    processingFee?: number;
    exchangeRateUsed?: number;
    paymentDate?: Date;
  };

  @ManyToOne(() => License, license => license.royaltyDistributions)
  @JoinColumn({ name: 'license_id' })
  license: License;

  @Column({ name: 'license_id' })
  licenseId: string;

  @ManyToOne(() => RightsHolder, rightsHolder => rightsHolder.royaltyDistributions)
  @JoinColumn({ name: 'rights_holder_id' })
  rightsHolder: RightsHolder;

  @Column({ name: 'rights_holder_id' })
  rightsHolderId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isPaid(): boolean {
    return this.status === DistributionStatus.PAID && this.paidAt !== null;
  }

  isPending(): boolean {
    return this.status === DistributionStatus.PENDING;
  }

  canBeApproved(): boolean {
    return this.status === DistributionStatus.CALCULATED && this.distributionAmount > 0;
  }

  calculateDistributionAmount(): number {
    return this.royaltyAmount * this.ownershipShare - this.deductions;
  }

  isOverdue(days: number = 30): boolean {
    if (this.status !== DistributionStatus.APPROVED) return false;
    
    const overdueDate = new Date(this.approvedAt);
    overdueDate.setDate(overdueDate.getDate() + days);
    return new Date() > overdueDate;
  }

  getEffectiveRate(): number {
    return this.royaltyRate * this.ownershipShare;
  }
}