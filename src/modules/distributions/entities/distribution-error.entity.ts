import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('distribution_errors')
export class DistributionError {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  releaseId: string;

  @Column()
  platform: string;

  @Column()
  errorCode: string;

  @Column({ type: 'text' })
  errorMessage: string;

  @Column({
    type: 'enum',
    enum: ErrorSeverity,
    default: ErrorSeverity.MEDIUM,
  })
  severity: ErrorSeverity;

  @Column({ type: 'json', nullable: true })
  errorDetails: Record<string, any>;

  @Column({ default: false })
  resolved: boolean;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ nullable: true })
  resolvedBy: string;

  @Column({ type: 'text', nullable: true })
  resolution: string;

  @CreateDateColumn()
  createdAt: Date;
}
