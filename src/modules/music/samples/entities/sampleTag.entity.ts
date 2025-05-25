import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Sample } from './sample.entity';

export enum TagCategory {
  MOOD = 'mood',
  INSTRUMENT = 'instrument',
  STYLE = 'style',
  TEMPO = 'tempo',
  ENERGY = 'energy',
  GENRE = 'genre',
  CUSTOM = 'custom',
}

@Entity('sample_tags')
@Index(['name', 'category'])
export class SampleTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: TagCategory,
    default: TagCategory.CUSTOM,
  })
  category: TagCategory;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: '#6B7280' })
  color: string; // Hex color for UI display

  @Column({ name: 'usage_count', default: 0 })
  usageCount: number;

  @ManyToMany(() => Sample, (sample) => sample.tags)
  samples: Sample[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}