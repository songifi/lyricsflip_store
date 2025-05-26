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
import { Rights } from './rights.entity';

export enum TransferType {
  ASSIGNMENT = 'assignment',
  LICENSE = 'license',
  SUBLICENSE = 'sublicense',
  REVERSION = 'reversion',
}

export enum TransferStatus {
  PENDING = 'pending',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

@Entity('rights_transfers')
@Index(['transferDate'])
@Index(['status'])
export class RightsTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  rightsId: string;

  @ManyToOne(() => Rights, (rights) => rights.transfers)
  @JoinColumn({ name: 'rightsId' })
  rights: Rights;

  @Column('uuid')
  transferorId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'transferorId' })
  transferor: User;

  @Column('uuid')
  transfereeId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'transfereeId' })
  transferee: User;

  @Column({
    type: 'enum',
    enum: TransferType,
  })
  transferType: TransferType;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.PENDING,
  })
  status: TransferStatus;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 4,
  })
  transferPercentage: number;

  @Column({ type: 'date' })
  transferDate: Date;

  @Column({ type: 'date', nullable: true })
  effectiveDate?: Date;

  @Column({ type: 'date', nullable: true })
  expirationDate?: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  considerationAmount?: number;

  @Column({ type: 'varchar', nullable: true })
  considerationCurrency?: string;

  @Column({ type: 'text', nullable: true })
  terms?: string;

  @Column({ type: 'text', nullable: true })
  conditions?: string;

  @Column({ type: 'varchar', nullable: true })
  contractReference?: string;

  @Column({ type: 'jsonb', nullable: true })
  documents?: Array<{
    filename: string;
    uploadDate: Date;
    documentType: string;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}