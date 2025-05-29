import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Publishing } from './publishing.entity';

@Entity()
export class PublishingStatement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Publishing)
  publishing: Publishing;

  @Column('jsonb')
  breakdown: any;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @CreateDateColumn()
  generatedAt: Date;
}
