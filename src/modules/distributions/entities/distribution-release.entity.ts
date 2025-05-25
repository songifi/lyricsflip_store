import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { DistributionPartner } from './distribution-partner.entity';
import { DistributionStatus } from './distribution-status.entity';

export enum ReleaseStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  PROCESSING = 'processing',
  LIVE = 'live',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('distribution_releases')
export class DistributionRelease {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  trackId: string; // Reference to track from music module

  @Column()
  albumId: string; // Reference to album from music module

  @Column()
  artistId: string; // Reference to artist

  @ManyToOne(() => DistributionPartner, partner => partner.releases)
  @JoinColumn({ name: 'partnerId' })
  partner: DistributionPartner;

  @Column()
  partnerId: string;

  @Column({
    type: 'enum',
    enum: ReleaseStatus,
    default: ReleaseStatus.PENDING,
  })
  status: ReleaseStatus;

  @Column({ type: 'timestamp', nullable: true })
  scheduledReleaseDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualReleaseDate: Date;

  @Column({ type: 'json', nullable: true })
  platformSpecificData: Record<string, any>;

  @Column({ nullable: true })
  externalReleaseId: string;

  @Column({ type: 'json', nullable: true })
  distributionMetadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => DistributionStatus, status => status.release)
  statusHistory: DistributionStatus[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
