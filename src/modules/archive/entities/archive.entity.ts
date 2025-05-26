import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Artist } from '../../artists/entities/artist.entity';
import { Track } from '../../music/tracks/entities/track.entity';
import { Album } from '../../music/albums/entities/album.entity';
import { User } from '../../users/entities/user.entity';
import { ArchiveContribution } from './archive-contribution.entity';
import { ArchiveMilestone } from './archive-milestone.entity';

@Entity('archives')
@Index(['artistId', 'status'])
@Index(['archiveType', 'createdAt'])
@Index(['preservationQuality', 'status'])
export class Archive {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ArchiveType,
    default: ArchiveType.MUSIC,
  })
  archiveType: ArchiveType;

  @Column({
    type: 'enum',
    enum: ArchiveStatus,
    default: ArchiveStatus.PENDING,
  })
  status: ArchiveStatus;

  @Column({
    type: 'enum',
    enum: PreservationQuality,
    default: PreservationQuality.STANDARD,
  })
  preservationQuality: PreservationQuality;

  // Historical metadata
  @Column({ type: 'jsonb', nullable: true })
  historicalMetadata: {
    originalRecordingDate?: Date;
    recordingLocation?: string;
    recordingStudio?: string;
    producer?: string;
    engineer?: string;
    instruments?: string[];
    personnel?: Array<{
      name: string;
      role: string;
      instrument?: string;
    }>;
    culturalContext?: string;
    historicalSignificance?: string;
    era?: string;
    movement?: string;
  };

  // Technical preservation data
  @Column({ type: 'jsonb', nullable: true })
  preservationData: {
    originalFormat?: string;
    digitalFormat?: string;
    bitRate?: number;
    sampleRate?: number;
    channels?: number;
    duration?: number;
    fileSize?: number;
    checksum?: string;
    preservationDate?: Date;
    preservationMethod?: string;
    qualityAssessment?: string;
  };

  // Rights and legal information
  @Column({ type: 'jsonb', nullable: true })
  rightsInformation: {
    copyrightHolder?: string;
    copyrightYear?: number;
    publishingRights?: string;
    masterRights?: string;
    mechanicalRights?: string;
    performanceRights?: string;
    estateContact?: string;
    legalNotes?: string;
  };

  // Archive location and access
  @Column({ type: 'varchar', length: 500, nullable: true })
  storageLocation: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  accessUrl: string;

  @Column({ type: 'boolean', default: false })
  isPubliclyAccessible: boolean;

  @Column({ type: 'boolean', default: false })
  requiresPermission: boolean;

  @Column({ type: 'text', nullable: true })
  accessConditions: string;

  // Relationships
  @Column({ type: 'uuid', nullable: true })
  artistId: string;

  @ManyToOne(() => Artist, { nullable: true })
  @JoinColumn({ name: 'artistId' })
  artist: Artist;

  @Column({ type: 'uuid', nullable: true })
  trackId: string;

  @ManyToOne(() => Track, { nullable: true })
  @JoinColumn({ name: 'trackId' })
  track: Track;

  @Column({ type: 'uuid', nullable: true })
  albumId: string;

  @ManyToOne(() => Album, { nullable: true })
  @JoinColumn({ name: 'albumId' })
  album: Album;

  @Column({ type: 'uuid' })
  contributorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'contributorId' })
  contributor: User;

  @OneToMany(() => ArchiveContribution, contribution => contribution.archive)
  contributions: ArchiveContribution[];

  @OneToMany(() => ArchiveMilestone, milestone => milestone.archive)
  milestones: ArchiveMilestone[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}