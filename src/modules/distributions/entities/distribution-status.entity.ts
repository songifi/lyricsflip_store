import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { DistributionRelease } from './distribution-release.entity';
import { ReleaseStatus } from './distribution-release.entity';

@Entity('distribution_status')
export class DistributionStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DistributionRelease, release => release.statusHistory)
  @JoinColumn({ name: 'releaseId' })
  release: DistributionRelease;

  @Column()
  releaseId: string;

  @Column({
    type: 'enum',
    enum: ReleaseStatus,
  })
  status: ReleaseStatus;

  @Column({
    type: 'enum',
    enum: ReleaseStatus,
    nullable: true,
  })
  previousStatus: ReleaseStatus;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  updatedBy: string; // User ID who updated the status

  @CreateDateColumn()
  createdAt: Date;
}
