import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Publishing } from './publishing.entity';

@Entity()
export class PerformanceRight {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  region: string;

  @Column('decimal', { precision: 10, scale: 2 })
  revenue: number;

  @ManyToOne(() => Publishing)
  publishing: Publishing;

  @CreateDateColumn()
  reportedAt: Date;
}
