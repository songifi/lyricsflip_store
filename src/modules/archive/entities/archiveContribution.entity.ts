import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Archive } from './archive.entity';
import { User } from '../../users/entities/user.entity';

@Entity('archive_contributions')
export class ArchiveContribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ContributionType,
  })
  contributionType: ContributionType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  contributionData: {
    files?: string[];
    metadata?: Record<string, any>;
    notes?: string;
    verificationStatus?: string;
    qualityScore?: number;
  };

  @Column({ type: 'uuid' })
  archiveId: string;

  @ManyToOne(() => Archive, archive => archive.contributions)
  @JoinColumn({ name: 'archiveId' })
  archive: Archive;

  @Column({ type: 'uuid' })
  contributorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'contributorId' })
  contributor: User;

  @CreateDateColumn()
  createdAt: Date;
}