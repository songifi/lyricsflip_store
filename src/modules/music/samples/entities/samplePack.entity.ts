import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Sample } from './sample.entity';
import { User } from '../../../users/entities/user.entity';
import { Artist } from '../../../artists/entities/artist.entity';
import { Genre } from '../../genres/entities/genre.entity';

export enum PackStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('sample_packs')
@Index(['status', 'createdAt'])
@Index(['creatorId', 'status'])
export class SamplePack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PackStatus,
    default: PackStatus.DRAFT,
  })
  status: PackStatus;

  @Column({ name: 'cover_image_url', nullable: true })
  coverImageUrl: string;

  // Pricing
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  discount: number;

  @Column({ name: 'bundle_discount', type: 'decimal', precision: 5, scale: 2, default: 0 })
  bundleDiscount: number; // Additional discount for buying as pack vs individual

  // Analytics
  @Column({ name: 'download_count', default: 0 })
  downloadCount: number;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  // Relations
  @Column({ name: 'creator_id' })
  creatorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  creator: User;

  @Column({ name: 'artist_id', nullable: true })
  artistId: string;

  @ManyToOne(() => Artist, { nullable: true })
  artist: Artist;

  @ManyToMany(() => Sample, (sample) => sample.samplePacks)
  @JoinTable({
    name: 'sample_pack_samples',
    joinColumn: { name: 'pack_id' },
    inverseJoinColumn: { name: 'sample_id' },
  })
  samples: Sample[];

  @ManyToMany(() => Genre)
  @JoinTable({
    name: 'sample_pack_genres',
    joinColumn: { name: 'pack_id' },
    inverseJoinColumn: { name: 'genre_id' },
  })
  genres: Genre[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual properties
  get effectivePrice(): number {
    return this.price * (1 - this.discount / 100);
  }

  get totalBundleDiscount(): number {
    return this.discount + this.bundleDiscount;
  }

  get finalPrice(): number {
    return this.price * (1 - this.totalBundleDiscount / 100);
  }
}