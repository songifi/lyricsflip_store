import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('distribution_metadata')
export class DistributionMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  releaseId: string;

  @Column()
  platform: string;

  @Column({ type: 'json' })
  metadata: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  platformSpecificMetadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncedAt: Date;

  @Column({ default: false })
  syncRequired: boolean;

  @Column({ type: 'text', nullable: true })
  syncErrors: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
