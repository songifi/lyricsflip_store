import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ReportType {
  PERFORMANCE = 'performance',
  MECHANICAL = 'mechanical',
  DIGITAL = 'digital',
  SYNCHRONIZATION = 'synchronization',
  NEIGHBORING = 'neighboring',
}

export enum ReportStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum CollectionSociety {
  ASCAP = 'ascap',
  BMI = 'bmi',
  SESAC = 'sesac',
  PRS = 'prs',
  GEMA = 'gema',
  SACEM = 'sacem',
  JASRAC = 'jasrac',
  SOCAN = 'socan',
}

@Entity('collection_society_reports')
@Index(['reportType'])
@Index(['status'])
@Index(['society'])
@Index(['reportingPeriod'])
export class CollectionSocietyReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  reportType: ReportType;

  @Column({
    type: 'enum',
    enum: CollectionSociety,
  })
  society: CollectionSociety;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.DRAFT,
  })
  status: ReportStatus;

  @Column('uuid')
  submittedById: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'submittedById' })
  submittedBy: User;

  @Column({ type: 'date' })
  reportingPeriodStart: Date;

  @Column({ type: 'date' })
  reportingPeriodEnd: Date;

  @Column()
  reportingPeriod: string; // e.g., "2024-Q1", "2024-01"

  @Column({ type: 'jsonb' })
  reportData: {
    works: Array<{
      workId: string;
      title: string;
      writers: Array<{
        name: string;
        ipi: string;
        share: number;
      }>;
      publishers: Array<{
        name: string;
        ipi: string;
        share: number;
      }>;
      performances?: Array<{
        date: Date;
        venue: string;
        territory: string;
        revenue: number;
      }>;
      mechanicals?: Array<{
        date: Date;
        units: number;
        territory: string;
        revenue: number;
      }>;
    }>;
    totalRevenue: number;
    currency: string;
  };

  @Column({ type: 'varchar', nullable: true })
  submissionReference?: string;

  @Column({ type: 'date', nullable: true })
  submissionDate?: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments?: Array<{
    filename: string;
    uploadDate: Date;
    fileType: string;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}