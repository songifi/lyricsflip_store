import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Sample } from './sample.entity';
import { User } from '../../../users/entities/user.entity';

export enum LicenseType {
  BASIC = 'basic',
  PREMIUM = 'premium',
  EXCLUSIVE = 'exclusive',
  ROYALTY_FREE = 'royalty_free',
}

export enum LicenseStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  PENDING = 'pending',
}

@Entity('sample_licenses')
@Index(['licenseeId', 'status'])
@Index(['sampleId', 'type'])
export class SampleLicense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  // License terms
  @Column('simple-json')
  terms: {
    commercialUse: boolean;
    distributionLimit?: number;
    creditRequired: boolean;
    resaleAllowed: boolean;
    exclusiveRights: boolean;
    royaltyRate?: number; // Percentage
    territory?: string[]; // Geographic restrictions
    duration?: number; // License duration in days, null for perpetual
    usageTypes: string[]; // e.g., ['streaming', 'radio', 'sync']
  };

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  royaltyRate: number; // Percentage for ongoing royalties

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @Column({ name: 'activated_at', nullable: true })
  activatedAt: Date;

  // Relations
  @Column({ name: 'sample_id' })
  sampleId: string;

  @ManyToOne(() => Sample, (sample) => sample.licenses, { onDelete: 'CASCADE' })
  sample: Sample;

  @Column({ name: 'licensee_id' })
  licenseeId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  licensee: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual properties
  get isActive(): boolean {
    return (
      this.status === LicenseStatus.ACTIVE &&
      (!this.expiresAt || this.expiresAt > new Date())
    );
  }

  get isExpired(): boolean {
    return this.expiresAt && this.expiresAt <= new Date();
  }
}