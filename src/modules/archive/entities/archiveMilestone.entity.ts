import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Archive } from './archive.entity';

@Entity('archive_milestones')
@Index(['archiveId', 'milestoneDate'])
@Index(['milestoneType', 'milestoneDate'])
export class ArchiveMilestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: MilestoneType,
  })
  milestoneType: MilestoneType;

  @Column({ type: 'date' })
  milestoneDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalData: {
    participants?: string[];
    venue?: string;
    significance?: string;
    culturalImpact?: string;
    mediaReferences?: string[];
    relatedEvents?: string[];
  };

  @Column({ type: 'uuid' })
  archiveId: string;

  @ManyToOne(() => Archive, archive => archive.milestones)
  @JoinColumn({ name: 'archiveId' })
  archive: Archive;

  @CreateDateColumn()
  createdAt: Date;
}