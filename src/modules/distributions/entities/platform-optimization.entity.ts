import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('platform_optimizations')
export class PlatformOptimization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  platform: string;

  @Column()
  releaseId: string;

  @Column({ type: 'json' })
  optimizationRules: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  appliedOptimizations: Record<string, any>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  performanceScore: number;

  @Column({ type: 'json', nullable: true })
  recommendations: string[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
