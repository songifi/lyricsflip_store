// src/audio/entities/audio-file.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('audio_files')
export class AudioFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  storedName: string;

  @Column()
  mimeType: string;

  @Column('float')
  duration: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column('jsonb', { nullable: true })
  qualityMetrics: Record<string, any>;

  @Column({ nullable: true })
  waveformPath: string;

  @Column({ nullable: true })
  fingerprintHash: string;

  @Column({ type: 'float', nullable: true })
  gainLevel: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
