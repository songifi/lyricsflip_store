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

export enum ConflictType {
  OWNERSHIP_DISPUTE = 'ownership_dispute',
  PERCENTAGE_MISMATCH = 'percentage_mismatch',
  OVERLAPPING_CLAIMS = 'overlapping_claims',
  EXPIRED_RIGHTS = 'expired_rights',
  INVALID_TRANSFER = 'invalid_transfer',
  TERRITORY_CONFLICT = 'territory_conflict',
}

export enum ConflictStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
}

export enum ConflictSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('rights_conflicts')
@Index(['conflictType'])
@Index(['status'])
@Index(['severity'])
export class RightsConflict {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  rightsId: string;

  @ManyToOne(() => Rights, (rights) => rights.conflicts)
  @JoinColumn({ name: 'rightsId' })
  rights: Rights;

  @Column({
    type: 'enum',
    enum: ConflictType,
  })
  conflictType: ConflictType;

  @Column({
    type: 'enum',
    enum: ConflictStatus,
    default: ConflictStatus.OPEN,
  })
  status: ConflictStatus;

  @Column({
    type: 'enum',
    enum: ConflictSeverity,
    default: ConflictSeverity.MEDIUM,
  })
  severity: ConflictSeverity;

  @Column({ type: 'text' })
  description: string;

  @Column('uuid', { nullable: true })
  reportedById?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reportedById' })
  reportedBy?: User;

  @Column('uuid', { nullable: true })
  assignedToId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo?: User;

  @Column({ type: 'jsonb', nullable: true })
  conflictingRights?: Array<{
    rightsId: string;
    ownerId: string;
    percentage: number;
  }>;

  @Column({ type: 'text', nullable: true })
  resolution?: string;

  @Column({ type: 'date', nullable: true })
  resolvedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  evidence?: Array<{
    filename: string;
    uploadDate: Date;
    description: string;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}