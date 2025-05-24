import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('distribution_analytics')
export class DistributionAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  releaseId: string;

  @Column()
  platform: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'bigint', default: 0 })
  streams: number;

  @Column({ type: 'bigint', default: 0 })
  downloads: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  revenue: number;

  @Column({ type: 'bigint', default: 0 })
  likes: number;

  @Column({ type: 'bigint', default: 0 })
  shares: number;

  @Column({ type: 'bigint', default: 0 })
  comments: number;

  @Column({ type: 'json', nullable: true })
  demographicData: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  geographicData: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
