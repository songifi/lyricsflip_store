import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Band } from './band.entity';

export enum AlbumStatus {
  PLANNING = 'planning',
  RECORDING = 'recording',
  MIXING = 'mixing',
  MASTERING = 'mastering',
  COMPLETED = 'completed',
  RELEASED = 'released',
}

@Entity('band_albums')
export class BandAlbum {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ uuid: true })
  bandId: string;

  @Column({ uuid: true, nullable: true })
  albumId: string; // Reference to main album entity

  @Column({ length: 100 })
  title: string;

  @Column({
    type: 'enum',
    enum: AlbumStatus,
    default: AlbumStatus.PLANNING,
  })
  status: AlbumStatus;

  @Column({ type: 'json', nullable: true })
  contributors: {
    memberId: string;
    role: string;
    contribution: string;
  }[];

  @Column({ type: 'json', nullable: true })
  revenueDistribution: Record<string, number>;

  @Column({ type: 'date', nullable: true })
  targetReleaseDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Band, (band) => band.albums, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bandId' })
  band: Band;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}