import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class RightsSocietyReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  societyName: string;

  @Column('jsonb')
  data: any;

  @CreateDateColumn()
  reportedAt: Date;
}
