// src/licensing/entities/rights-holder.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { License } from './license.entity';
import { RoyaltyDistribution } from './royalty-distribution.entity';

export enum RightsHolderType {
  ARTIST = 'artist',
  PUBLISHER = 'publisher',
  RECORD_LABEL = 'record_label',
  SONGWRITER = 'songwriter',
  COMPOSER = 'composer',
  ESTATE = 'estate',
  COLLECTIVE = 'collective',
}

export enum RightsHolderStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

@Entity('rights_holders')
export class RightsHolder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  legalName: string;

  @Column({
    type: 'enum',
    enum: RightsHolderType,
  })
  type: RightsHolderType;

  @Column({
    type: 'enum',
    enum: RightsHolderStatus,
    default: RightsHolderStatus.PENDING_VERIFICATION,
  })
  status: RightsHolderStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ipi: string; // Interested Party Information code

  @Column({ type: 'varchar', length: 100, nullable: true })
  isni: string; // International Standard Name Identifier

  @Column({ type: 'varchar', length: 100, nullable: true })
  taxId: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'jsonb' })
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  bankingInfo: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    swiftCode?: string;
    iban?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  territories: string[]; // Territories where they hold rights

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 1.0 })
  defaultRoyaltyShare: number; // Default ownership percentage

  @Column({ type: 'jsonb', nullable: true })
  performanceRightsSocieties: {
    ascap?: string;
    bmi?: string;
    sesac?: string;
    prs?: string;
    gema?: string;
    sacem?: string;
    jasrac?: string;
    other?: { name: string; memberNumber: string }[];
  };

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verifiedBy: string;

  @Column({ type: 'jsonb', nullable: true })
  documents: {
    id: string;
    type: string;
    filename: string;
    uploadedAt: Date;
  }[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => License, license => license.rightsHolder)
  licenses: License[];

  @OneToMany(() => RoyaltyDistribution, distribution => distribution.rightsHolder)
  royaltyDistributions: RoyaltyDistribution[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isActive(): boolean {
    return this.status === RightsHolderStatus.ACTIVE && this.isVerified;
  }

  canReceiveRoyalties(): boolean {
    return this.isActive() && this.bankingInfo !== null;
  }

  getActiveLicensesCount(): number {
    return this.licenses?.filter(license => license.isActive()).length || 0;
  }

  hasValidBankingInfo(): boolean {
    return !!(
      this.bankingInfo &&
      this.bankingInfo.bankName &&
      this.bankingInfo.accountNumber
    );
  }
}