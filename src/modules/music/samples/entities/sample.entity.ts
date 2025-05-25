import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { Artist } from '../../../artists/entities/artist.entity';
import { Genre } from '../../genres/entities/genre.entity';
import { SampleLicense } from './sample-license.entity';
import { SamplePack } from './sample-pack.entity';
import { SampleTag } from './sample-tag.entity';
import { SampleUsage } from './sample-usage.entity';
import { Purchase } from '../../../purchases/entities/purchase.entity';

export enum SampleType {
  BEAT = 'beat',
  LOOP = 'loop',
  ONE_SHOT = 'one_shot',
  VOCAL = 'vocal',
  INSTRUMENT = 'instrument',
}

export enum SampleStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

@Entity('samples')
@Index(['status', 'createdAt'])
@Index(['type', 'status'])
@Index(['creatorId', 'status'])
export class Sample {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: SampleType,
  })
  type: SampleType;

  @Column({
    type: 'enum',
    enum: SampleStatus,
    default: SampleStatus.DRAFT,
  })
  status: SampleStatus;

  // Audio file information
  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ name: 'preview_url', nullable: true })
  previewUrl: string;

  @Column({ name: 'file_size' })
  fileSize: number; // in bytes

  @Column({ name: 'duration' })
  duration: number; // in seconds

  @Column({ name: 'sample_rate', default: 44100 })
  sampleRate: number;

  @Column({ name: 'bit_depth', default: 16 })
  bitDepth: number;

  @Column({ length: 10, nullable: true })
  key: string; // Musical key (e.g., 'C', 'Am')

  @Column({ nullable: true })
  bpm: number; // Beats per minute

  // Pricing
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  discount: number; // Percentage discount

  // Licensing
  @Column({ name: 'allows_exclusive_licensing', default: true })
  allowsExclusiveLicensing: boolean;

  @Column({ name: 'exclusive_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  exclusivePrice: number;

  @Column({ name: 'is_exclusively_licensed', default: false })
  isExclusivelyLicensed: boolean;

  @Column({ name: 'exclusive_licensee_id', nullable: true })
  exclusiveLicenseeId: string;

  // Analytics
  @Column({ name: 'play_count', default: 0 })
  playCount: number;

  @Column({ name: 'download_count', default: 0 })
  downloadCount: number;

  @Column({ name: 'like_count', default: 0 })
  likeCount: number;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  // Metadata
  @Column('simple-json', { nullable: true })
  metadata: {
    originalFilename?: string;
    uploadedAt?: Date;
    processingStatus?: string;
    waveformData?: number[];
    [key: string]: any;
  };

  // Relations
  @Column({ name: 'creator_id' })
  creatorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  creator: User;

  @Column({ name: 'artist_id', nullable: true })
  artistId: string;

  @ManyToOne(() => Artist, { nullable: true })
  artist: Artist;

  @ManyToMany(() => Genre)
  @JoinTable({
    name: 'sample_genres',
    joinColumn: { name: 'sample_id' },
    inverseJoinColumn: { name: 'genre_id' },
  })
  genres: Genre[];

  @ManyToMany(() => SampleTag)
  @JoinTable({
    name: 'sample_sample_tags',
    joinColumn: { name: 'sample_id' },
    inverseJoinColumn: { name: 'tag_id' },
  })
  tags: SampleTag[];

  @OneToMany(() => SampleLicense, (license) => license.sample)
  licenses: SampleLicense[];

  @ManyToMany(() => SamplePack, (pack) => pack.samples)
  samplePacks: SamplePack[];

  @OneToMany(() => SampleUsage, (usage) => usage.sample)
  usages: SampleUsage[];

  @OneToMany(() => Purchase, (purchase) => purchase.sample)
  purchases: Purchase[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual properties
  get effectivePrice(): number {
    return this.price * (1 - this.discount / 100);
  }

  get isAvailableForLicensing(): boolean {
    return this.status === SampleStatus.APPROVED && !this.isExclusivelyLicensed;
  }
}