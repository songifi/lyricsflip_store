import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Publishing } from './publishing.entity';

@Entity()
export class Songwriter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 5, scale: 2 })
  splitPercentage: number;

  @ManyToOne(() => Publishing, publishing => publishing.songwriters)
  publishing: Publishing;
}
